import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, UserProfileResponse } from '@nexora/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user and default workspace in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: dto.fullName.trim(),
        },
      });

      // Generate clean slug from user's full name
      const baseSlug = dto.fullName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'workspace';
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      const workspace = await tx.workspace.create({
        data: {
          name: `${dto.fullName.trim()}'s Workspace`,
          slug,
        },
      });

      const member = await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      return { user, workspace, role: member.role };
    });

    this.logger.log(`New user registered: ${result.user.email} with workspace: ${result.workspace.name}`);

    const accessToken = this.jwtService.sign({
      sub: result.user.id,
      email: result.user.email,
      workspaceId: result.workspace.id,
    });

    return {
      accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
      },
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug,
        role: result.role,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Identify active workspace
    const primaryMembership = user.memberships[0];
    if (!primaryMembership) {
      throw new UnauthorizedException('User does not belong to any workspace');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      workspaceId: primaryMembership.workspaceId,
    });

    this.logger.log(`User logged in: ${user.email} (Workspace: ${primaryMembership.workspace.name})`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      workspace: {
        id: primaryMembership.workspace.id,
        name: primaryMembership.workspace.name,
        slug: primaryMembership.workspace.slug,
        role: primaryMembership.role,
      },
    };
  }

  async getMe(userId: string): Promise<UserProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const workspaces = user.memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
    }));

    const activeWorkspaceId = workspaces[0]?.id || '';

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      workspaces,
      activeWorkspaceId,
    };
  }
}
