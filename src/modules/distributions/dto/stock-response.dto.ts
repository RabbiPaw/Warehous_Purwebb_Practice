import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StockResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  productId: string;

  @Expose()
  @ApiProperty({ example: 'Dell U2720Q Monitor' })
  productName: string;

  @Expose()
  @ApiProperty({ example: 8 })
  totalQuantity: number;

  @Expose()
  @ApiProperty({ example: 'p' })
  unitCode: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  warehouseId: string;

  @Expose()
  @ApiProperty({ example: 'Main Warehouse' })
  warehouseName: string;
}