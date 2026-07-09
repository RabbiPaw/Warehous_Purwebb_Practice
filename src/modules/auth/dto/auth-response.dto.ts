import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    example: 'admin@warehouse.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: 'Admin',
    description: 'First name',
  })
  name: string;

  @ApiProperty({
    example: 'System',
    description: 'Last name',
  })
  surname: string;

  @ApiProperty({
    example: 'Administrator',
    description: 'Role name',
  })
  role: string;
}