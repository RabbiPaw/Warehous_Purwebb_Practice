import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UnitResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'p' })
  code: string;

  @Expose()
  @ApiProperty({ example: 'Штука' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'Единица измерения количества' })
  description: string | null;

  @Expose()
  @ApiProperty({ example: 1 })
  sortOrder: number | null;

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