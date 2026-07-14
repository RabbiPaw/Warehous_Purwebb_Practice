import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWarehouseSettingsDto {
  @ApiProperty({
    example: 1000,
    description: 'Вместимость склада',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Вместимость должна быть больше 0' })
  capacity?: number;

  @ApiProperty({
    example: 10,
    description: 'Процент порога для уведомления',
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Процент порога должен быть от 0 до 100' })
  @Max(100, { message: 'Процент порога должен быть от 0 до 100' })
  thresholdPercent?: number;
}