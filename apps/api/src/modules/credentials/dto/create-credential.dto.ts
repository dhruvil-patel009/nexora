import { IsNotEmpty, IsString, IsEnum, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CredentialTypeEnum {
  API_KEY = 'API_KEY',
  BEARER_TOKEN = 'BEARER_TOKEN',
  BASIC_AUTH = 'BASIC_AUTH',
  CUSTOM_HEADER = 'CUSTOM_HEADER',
}

export class CreateCredentialDto {
  @ApiProperty({
    example: 'STRIPE_API_KEY',
    description: 'Unique identifier name for referencing in nodes e.g. {{credentials.STRIPE_API_KEY}}',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Credential name can only contain letters, numbers, underscores, and dashes',
  })
  name!: string;

  @ApiProperty({
    enum: CredentialTypeEnum,
    example: CredentialTypeEnum.API_KEY,
    description: 'Authentication type category',
  })
  @IsNotEmpty()
  @IsEnum(CredentialTypeEnum)
  type!: CredentialTypeEnum;

  @ApiProperty({
    example: 'sk_live_51M0...sample',
    description: 'Plaintext secret value to encrypt at rest using AES-256-GCM',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  value!: string;
}
