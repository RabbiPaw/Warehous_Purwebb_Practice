import { Controller, Get, Patch, Post, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { UpdateWarehouseSettingsDto } from './dto/update-warehouse-settings.dto';
import { WarehouseSettingsResponseDto } from './dto/warehouse-settings-response.dto';
import { WarehouseSettingsHistoryResponseDto } from './dto/warehouse-settings-history-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { IUser } from '../../common/interfaces/user.interface';

@ApiTags('warehouse')
@Controller('warehouse')
@ApiBearerAuth('JWT-auth')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('settings')
  @Roles('Administrator', 'Accountant', 'Storekeeper')
  @ApiOperation({
    summary: 'Получить настройки склада',
    description: 'Получение текущих настроек всех складов или конкретного склада.',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    description: 'ID склада',
  })
  @ApiResponse({
    status: 200,
    description: 'Настройки получены',
    type: [WarehouseSettingsResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(WarehouseSettingsResponseDto)
  getSettings(@Query('warehouseId') warehouseId?: string) {
    return this.warehouseService.getSettings(warehouseId);
  }

  @Patch('settings/:warehouseId')
  @Roles('Administrator')
  @ApiOperation({
    summary: 'Обновить настройки склада',
    description: 'Обновление вместимости и порогового процента склада. Доступно только для администратора.',
  })
  @ApiParam({ name: 'warehouseId', description: 'ID склада' })
  @ApiResponse({
    status: 200,
    description: 'Настройки обновлены',
    type: WarehouseSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Склад не найден' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(WarehouseSettingsResponseDto)
  updateSettings(
    @Param('warehouseId') warehouseId: string,
    @Body() dto: UpdateWarehouseSettingsDto,
    @CurrentUser() user: IUser,
  ) {
    return this.warehouseService.updateSettings(warehouseId, dto, user);
  }
  @Get('settings/history/:warehouseId')
  @Roles('Administrator', 'Accountant')
  @ApiOperation({
    summary: 'Получить историю настроек склада',
    description: 'Получение истории изменений настроек склада. Доступно для администратора и бухгалтера.',
  })
  @ApiParam({ name: 'warehouseId', description: 'ID склада' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество записей на странице',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Смещение для пагинации',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'История настроек получена',
    type: [WarehouseSettingsHistoryResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Склад не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(WarehouseSettingsHistoryResponseDto)
  getHistory(
    @Param('warehouseId') warehouseId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.warehouseService.getHistory(warehouseId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('all')
  @Roles('Administrator', 'Accountant', 'Storekeeper')
  @ApiOperation({
    summary: 'Получить все склады',
    description: 'Получение списка всех складов.',
  })
  @ApiResponse({ status: 200, description: 'Список складов получен' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  getAllWarehouses() {
    return this.warehouseService.getAllWarehouses();
  }

  @Get('occupancy')
  @Roles('Administrator', 'Accountant', 'Storekeeper')
  @ApiOperation({
    summary: 'Получить статистику занятости склада',
    description: 'Получение статистики занятости всех складов или конкретного склада.',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    description: 'ID склада',
  })
  @ApiResponse({ status: 200, description: 'Статистика получена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  getOccupancyStats(@Query('warehouseId') warehouseId?: string) {
    return this.warehouseService.getWarehouseOccupancyStats(warehouseId);
  }
}