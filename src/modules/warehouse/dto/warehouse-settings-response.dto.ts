import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WarehouseSettingsResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  warehouseId: string;

  @Expose()
  @ApiProperty({ example: 'Основной склад' })
  warehouseName: string;

  @Expose()
  @ApiProperty({ example: 1000 })
  capacity: number;

  @Expose()
  @ApiProperty({ example: 450 })
  currentOccupancy: number;

  @Expose()
  @ApiProperty({ example: 45 })
  occupancyPercent: number;

  @Expose()
  @ApiProperty({ example: 10 })
  thresholdPercent: number;

  @Expose()
  @ApiProperty({ example: true })
  isThresholdExceeded: boolean;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userUpdaterId: string;

  @Expose()
  @ApiProperty({ example: 'Admin' })
  updaterName: string;

  @Expose()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}