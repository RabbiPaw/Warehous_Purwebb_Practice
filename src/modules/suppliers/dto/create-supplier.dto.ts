import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'ООО "ТехноПоставка"',
    description: 'Название поставщика',
  })
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  name: string;

  @ApiProperty({
    example: '1234567890',
    description: 'ИНН поставщика',
  })
  @IsString()
  @IsNotEmpty({ message: 'ИНН обязателен' })
  inn: string;

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