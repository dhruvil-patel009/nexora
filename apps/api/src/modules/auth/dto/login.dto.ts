import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'developer@nexora.dev', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({ example: 'Secret123!', description: 'Account password' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}
