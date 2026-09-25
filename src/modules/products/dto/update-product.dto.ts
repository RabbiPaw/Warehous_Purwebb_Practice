import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({
    example: 'Монитор Dell U2720Q',
    description: 'Название товара',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: '27-дюймовый 4K монитор',
    description: 'Описание товара',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID единицы измерения',
    required: false,
  })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiProperty({
    example: true,
    description: 'Активен ли товар',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}