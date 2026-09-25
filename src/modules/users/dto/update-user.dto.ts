import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Неверный формат email' })
  email?: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  name?: string;

  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  surname?: string;

  @ApiProperty({
    example: 'Петрович',
    description: 'Отчество',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Отчество не должно превышать 50 символов' })
  patronymic?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID роли',
    required: false,
  })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiProperty({
    example: true,
    description: 'Активен ли пользователь',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}