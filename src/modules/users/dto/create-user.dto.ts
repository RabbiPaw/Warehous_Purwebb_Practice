import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Неверный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль (мин. 6 символов)',
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(100, { message: 'Пароль не должен превышать 100 символов' })
  password: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя',
  })
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  name: string;

  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия',
  })
  @IsString()
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  surname: string;

  @ApiProperty({
    example: 'Петрович',
    description: 'Отчество (опционально)',
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
}