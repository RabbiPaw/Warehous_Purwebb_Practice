import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DistributionResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @Expose()
  @ApiProperty({ example: 'Admin' })
  userName: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  distributionTypeId: string;

  @Expose()
  @ApiProperty({ example: 'Supply' })
  distributionTypeName: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  productId: string;

  @Expose()
  @ApiProperty({ example: 'Dell U2720Q Monitor' })
  productName: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  supplierId: string;

  @Expose()
  @ApiProperty({ example: 'TechnoSupply LLC' })
  supplierName: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  warehouseId: string;

  @Expose()
  @ApiProperty({ example: 'Main Warehouse' })
  warehouseName: string;

  @Expose()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  distributionDate: Date;

  @Expose()
  @ApiProperty({ example: 10 })
  quantity: number;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  unitId: string;

  @Expose()
  @ApiProperty({ example: 'p' })
  unitCode: string;

  @Expose()
  @ApiProperty({ example: 'Поставка мониторов' })
  description: string | null;

  @Expose()
  @ApiProperty({ example: 1 })
  sign: number; // 1 - приход, -1 - расход, 0 - корректировка

  @Expose()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}