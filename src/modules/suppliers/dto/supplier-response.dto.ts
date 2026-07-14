import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SupplierResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'ООО "ТехноПоставка"' })
  name: string;

  @Expose()
  @ApiProperty({ example: '1234567890' })
  inn: string;

  @Expose()
  @ApiProperty({ example: '+7 (495) 123-45-67, tech@supply.ru' })
  contact: string | null;

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