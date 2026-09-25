import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { IUser } from '../../common/interfaces/user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  // Используем AuthResponseDto для сериализации (без пароля и roleId)
  @Serialize(AuthResponseDto)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Serialize(AuthResponseDto)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  // Сериализуем как полного пользователя
  @Serialize(UserResponseDto)
  getMe(@CurrentUser() user: IUser) {
    return user;
  }

  // ============================================
  // Тестовые эндпоинты — без сериализации (просто возвращаем объект)
  // ============================================

  @Get('test/all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Доступ для всех авторизованных' })
  testAll(@CurrentUser() user: IUser) {
    return { 
      message: 'Доступ разрешен', 
      role: user.roleName,
      email: user.email 
    };
  }

  @Get('test/admin')
  @Roles('Administrator')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Только администратор' })
  testAdmin(@CurrentUser() user: IUser) {
    return { 
      message: 'Доступ разрешен администратору', 
      role: user.roleName 
    };
  }

  @Get('test/storekeeper')
  @Roles('Storekeeper')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Только кладовщик' })
  testStorekeeper(@CurrentUser() user: IUser) {
    return { 
      message: 'Доступ разрешен кладовщику', 
      role: user.roleName 
    };
  }

  @Get('test/accountant')
  @Roles('Accountant')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Только бухгалтер' })
  testAccountant(@CurrentUser() user: IUser) {
    return { 
      message: 'Доступ разрешен бухгалтеру', 
      role: user.roleName 
    };
  }

  @Get('test/admin-or-storekeeper')
  @Roles('Administrator', 'Storekeeper')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Администратор или кладовщик' })
  testAdminOrStorekeeper(@CurrentUser() user: IUser) {
    return { 
      message: 'Доступ разрешен', 
      role: user.roleName 
    };
  }
}