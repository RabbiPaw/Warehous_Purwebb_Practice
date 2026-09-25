import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AuthResponseDto {
  @Expose()
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @Expose()
  @ApiProperty({ example: 'admin@warehouse.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'Admin' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'System' })
  surname: string;

  @Expose()
  @ApiProperty({ example: 'Administrator' })
  role: string;
}