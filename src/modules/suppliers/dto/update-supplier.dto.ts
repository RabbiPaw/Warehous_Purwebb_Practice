import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSupplierDto {
  @ApiProperty({
    example: 'ООО "ТехноПоставка"',
    description: 'Название поставщика',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'ИНН поставщика',
    required: false,
  })
  @IsOptional()
  @IsString()
  inn?: string;

  @ApiProperty({
    example: '+7 (495) 123-45-67, tech@supply.ru',
    description: 'Контактная информация',
    required: false,
  })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({
    example: true,
    description: 'Активен ли поставщик',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}