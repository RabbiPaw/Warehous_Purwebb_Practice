import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Монитор Dell U2720Q' })
  name: string;

  @Expose()
  @ApiProperty({ example: '27-дюймовый 4K монитор' })
  description: string | null;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  unitId: string;

  @Expose()
  @ApiProperty({ example: 'Штука' })
  unitName: string;

  @Expose()
  @ApiProperty({ example: 'p' })
  unitCode: string;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}