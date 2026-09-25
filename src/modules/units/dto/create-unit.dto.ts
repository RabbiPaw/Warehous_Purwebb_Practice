import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUnitDto {
  @ApiProperty({
    example: 'p',
    description: 'Код единицы измерения',
  })
  @IsString()
  @IsNotEmpty({ message: 'Код обязателен' })
  code: string;

  @ApiProperty({
    example: 'Штука',
    description: 'Название единицы измерения',
  })
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  name: string;

  @ApiProperty({
    example: 'Единица измерения количества',
    description: 'Описание',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Порядок сортировки',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({
    example: true,
    description: 'Активна ли единица измерения',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}