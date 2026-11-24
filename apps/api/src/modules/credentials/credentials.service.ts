import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { EncryptionService } from './encryption.service';
import { CredentialType } from '@prisma/client';

@Injectable()
export class CredentialsService {
  private readonly logger = new Logger(CredentialsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to produce an unrevealing masked representation (e.g. sk_•••••••• or ••••••••).
   */
  private maskSecret(value: string): string {
    if (!value || value.length < 6) return '••••••••';
    const prefix = value.slice(0, 3);
    return `${prefix}••••••••`;
  }

  async create(workspaceId: string, dto: CreateCredentialDto) {
    const normalizedName = dto.name.trim();

    // Enforce unique credential name per workspace
    const existing = await this.prisma.credential.findFirst({
      where: {
        workspaceId,
        name: normalizedName,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Credential with name "${normalizedName}" already exists in this workspace`,
      );
    }

    const encrypted = EncryptionService.encrypt(dto.value);

    const credential = await this.prisma.credential.create({
      data: {
        workspaceId,
        name: normalizedName,
        type: dto.type as CredentialType,
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      },
    });

    this.logger.log(
      `Credential "${credential.name}" (${credential.type}) securely vaulted for workspace ${workspaceId}`,
    );

    return {
      id: credential.id,
      name: credential.name,
      type: credential.type,
      maskedPreview: this.maskSecret(dto.value),
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  async list(workspaceId: string) {
    const credentials = await this.prisma.credential.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return credentials.map((cred) => ({
      ...cred,
      maskedPreview: '••••••••',
    }));
  }

  async delete(workspaceId: string, id: string) {
    const existing = await this.prisma.credential.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new NotFoundException(`Credential with ID ${id} not found in this workspace`);
    }

    await this.prisma.credential.delete({
      where: { id },
    });

    this.logger.log(`Credential "${existing.name}" deleted from workspace ${workspaceId}`);
    return {
      success: true,
      message: `Credential "${existing.name}" successfully deleted`,
    };
  }

  /**
   * Internal worker method: Decrypts all workspace credentials in memory.
   * NEVER exposed to HTTP endpoints or logs.
   */
  async getDecryptedMap(workspaceId: string): Promise<Record<string, string>> {
    const credentials = await this.prisma.credential.findMany({
      where: { workspaceId },
    });

    const decryptedMap: Record<string, string> = {};
    for (const cred of credentials) {
      try {
        const plaintext = EncryptionService.decrypt(
          cred.encryptedData,
          cred.iv,
          cred.authTag,
        );
        decryptedMap[cred.name] = plaintext;
      } catch (err: any) {
        this.logger.error(
          `Failed to decrypt credential "${cred.name}" for workspace ${workspaceId}: ${err.message}`,
        );
      }
    }

    return decryptedMap;
  }
}
