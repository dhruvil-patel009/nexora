import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'developer@nexora.dev', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({ example: 'Secret123!', minLength: 8, description: 'Password (min 8 characters)' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100)
  password!: string;

  @ApiProperty({ example: 'Alex Mercer', description: 'User full name' })
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(100)
  fullName!: string;
}
