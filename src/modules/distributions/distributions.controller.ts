import {Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery} from '@nestjs/swagger';
import { DistributionsService } from './distributions.service';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { DistributionResponseDto } from './dto/distribution-response.dto';
import { DistributionCursorResponseDto } from './dto/distribution-cursor-response.dto';
import { StockResponseDto } from './dto/stock-response.dto';
import { DistributionQueryDto } from './dto/distribution-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { IUser } from '../../common/interfaces/user.interface';

@ApiTags('distributions')
@Controller('distributions')
@ApiBearerAuth('JWT-auth')
export class DistributionsController {
  constructor(private readonly distributionsService: DistributionsService) {}

  @Post('income')
  @Roles('Accountant', 'Administrator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создать приход',
    description: 'Создание прихода товара. Доступно для бухгалтера и администратора.',
  })
  @ApiResponse({ status: 201, description: 'Приход создан', type: DistributionResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(DistributionResponseDto)
  createIncome(@Body() dto: CreateDistributionDto, @CurrentUser() user: IUser) {
    return this.distributionsService.createIncome(dto, user);
  }

  @Post('outcome')
  @Roles('Storekeeper', 'Administrator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создать расход',
    description: 'Создание расхода товара. Доступно для кладовщика и администратора.',
  })
  @ApiResponse({ status: 201, description: 'Расход создан', type: DistributionResponseDto })
  @ApiResponse({ status: 400, description: 'Недостаточно товара или ошибка валидации' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(DistributionResponseDto)
  createOutcome(@Body() dto: CreateDistributionDto, @CurrentUser() user: IUser) {
    return this.distributionsService.createOutcome(dto, user);
  }

  @Post('defect')
  @Roles('Administrator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создать брак',
    description: 'Списание товара в брак. Доступно только для администратора.',
  })
  @ApiResponse({ status: 201, description: 'Брак создан', type: DistributionResponseDto })
  @ApiResponse({ status: 400, description: 'Недостаточно товара или ошибка валидации' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(DistributionResponseDto)
  createDefect(@Body() dto: CreateDistributionDto, @CurrentUser() user: IUser) {
    return this.distributionsService.createDefect(dto, user);
  }

  @Post('adjustment')
  @Roles('Administrator', 'Accountant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создать корректировку',
    description: 'Корректировка количества товара. Доступно для администратора и бухгалтера.',
  })
  @ApiResponse({ status: 201, description: 'Корректировка создана', type: DistributionResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(DistributionResponseDto)
  createAdjustment(@Body() dto: CreateDistributionDto, @CurrentUser() user: IUser) {
    return this.distributionsService.createAdjustment(dto, user);
  }

  @Get()
  @Roles('Administrator', 'Storekeeper', 'Accountant')
  @ApiOperation({
    summary: 'Получить историю перемещений',
    description: 'Получение списка всех перемещений с курсорной пагинацией и фильтрами.',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Курсор для пагинации (ID последней записи)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество записей на странице (от 1 до 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'Фильтр по ID товара',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    description: 'Фильтр по ID склада',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Фильтр по дате "от"',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: 'Фильтр по дате "до"',
  })
  @ApiResponse({
    status: 200,
    description: 'История перемещений получена',
    type: DistributionCursorResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  findAllWithCursor(@Query() query: DistributionQueryDto) {
    return this.distributionsService.findAllWithCursor(query);
  }

  @Get(':id')
  @Roles('Administrator', 'Storekeeper', 'Accountant')
  @ApiOperation({
    summary: 'Получить перемещение по ID',
    description: 'Получение информации о конкретном перемещении.',
  })
  @ApiParam({ name: 'id', description: 'ID перемещения' })
  @ApiResponse({ status: 200, description: 'Перемещение найдено', type: DistributionResponseDto })
  @ApiResponse({ status: 404, description: 'Перемещение не найдено' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(DistributionResponseDto)
  findOne(@Param('id') id: string) {
    return this.distributionsService.findOne(id);
  }

  @Get('product/:id')
  @Roles('Administrator', 'Storekeeper', 'Accountant')
  @ApiOperation({
    summary: 'Получить историю по товару',
    description: 'Получение истории перемещений для конкретного товара с курсорной пагинацией.',
  })
  @ApiParam({ name: 'id', description: 'ID товара' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Курсор для пагинации (ID последней записи)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество записей на странице (от 1 до 100)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'История по товару получена',
    type: DistributionCursorResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  getProductHistoryWithCursor(
    @Param('id') productId: string,
    @Query() query: Omit<DistributionQueryDto, 'productId'>,
  ) {
    return this.distributionsService.getProductHistoryWithCursor(productId, query);
  }

  @Get('stock/:id')
  @Roles('Administrator', 'Storekeeper', 'Accountant')
  @ApiOperation({
    summary: 'Получить текущий остаток товара',
    description: 'Получение текущего остатка товара на складе.',
  })
  @ApiParam({ name: 'id', description: 'ID товара' })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    description: 'Фильтр по ID склада',
  })
  @ApiResponse({
    status: 200,
    description: 'Остаток товара получен',
    type: [StockResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(StockResponseDto)
  getStock(
    @Param('id') productId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.distributionsService.getStock(productId, warehouseId);
  }
}