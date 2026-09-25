import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDistributionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product ID',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Supplier ID',
  })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Warehouse ID',
  })
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({
    example: 10,
    description: 'Quantity',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unit ID',
  })
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Distribution date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  distributionDate?: string;

  @ApiProperty({
    example: 'Поставка мониторов',
    description: 'Description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}