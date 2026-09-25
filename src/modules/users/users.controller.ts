import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersPaginatedResponseDto } from './dto/users-paginated-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { IUser } from '../../common/interfaces/user.interface';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
@Roles('Administrator')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список пользователей',
    description: 'Получение списка всех пользователей с пагинацией и фильтрами. Доступно только для администратора.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество записей на странице',
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по email, имени или фамилии',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Фильтр по роли',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Фильтр по активности',
  })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей получен',
    type: UsersPaginatedResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить пользователя по ID',
    description: 'Получение информации о конкретном пользователе. Доступно только для администратора.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь найден',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UserResponseDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Создать пользователя',
    description: 'Создание нового пользователя. Доступно только для администратора.',
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь создан',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UserResponseDto)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить пользователя',
    description: 'Обновление информации о пользователе. Доступно только для администратора.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь обновлен',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UserResponseDto)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/role')
  @ApiOperation({
    summary: 'Сменить роль пользователя',
    description: 'Изменение роли пользователя. Доступно только для администратора.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Роль изменена',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 400, description: 'Роль не найдена или неактивна' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UserResponseDto)
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto.roleId);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Активировать/деактивировать пользователя',
    description: 'Переключение статуса активности пользователя. Доступно только для администратора.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Статус активности изменен',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UserResponseDto)
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить пользователя (soft delete)',
    description: 'Деактивация пользователя (soft delete). Доступно только для администратора.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({ status: 204, description: 'Пользователь деактивирован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  remove(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Get(':id/warehouses')
  @ApiOperation({
    summary: 'Получить склады пользователя',
    description: 'Получение списка складов, к которым у пользователя есть доступ. Доступно только для администратора.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Список складов получен' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  getWarehouses(@Param('id') id: string) {
    return this.usersService.getWarehouses(id);
  }

  @Post(':id/warehouses/:warehouseId')
  @ApiOperation({
    summary: 'Предоставить доступ к складу',
    description: 'Предоставление пользователю доступа к складу. Доступно только для администратора.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiParam({ name: 'warehouseId', description: 'ID склада' })
  @ApiResponse({ status: 200, description: 'Доступ предоставлен' })
  @ApiResponse({ status: 404, description: 'Пользователь или склад не найден' })
  @ApiResponse({ status: 409, description: 'Доступ уже предоставлен' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  grantWarehouseAccess(
    @Param('id') userId: string,
    @Param('warehouseId') warehouseId: string,
    @CurrentUser() admin: IUser,
  ) {
    return this.usersService.grantWarehouseAccess(userId, warehouseId, admin.id);
  }

  @Delete(':id/warehouses/:warehouseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Отозвать доступ к складу',
    description: 'Отзыв доступа пользователя к складу. Доступно только для администратора.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiParam({ name: 'warehouseId', description: 'ID склада' })
  @ApiResponse({ status: 204, description: 'Доступ отозван' })
  @ApiResponse({ status: 404, description: 'Пользователь или доступ не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  revokeWarehouseAccess(
    @Param('id') userId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.usersService.revokeWarehouseAccess(userId, warehouseId);
  }

  @Get('roles/all')
  @ApiOperation({
    summary: 'Получить все роли',
    description: 'Получение списка всех доступных ролей. Доступно только для администратора.',
  })
  @ApiResponse({ status: 200, description: 'Список ролей получен' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  getAllRoles() {
    return this.usersService.getAllRoles();
  }
}