import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery} from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitResponseDto } from './dto/unit-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Serialize } from '../../common/decorators/serialize.decorator';

@ApiTags('units')
@Controller('units')
@ApiBearerAuth('JWT-auth')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @Roles('Administrator', 'Accountant')
  @ApiOperation({
    summary: 'Получить список единиц измерения',
    description: 'Получение списка всех единиц измерения с фильтрами. Доступно для администратора и бухгалтера.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по коду или названию' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Фильтр по активности' })
  @ApiResponse({ status: 200, type: [UnitResponseDto] })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UnitResponseDto)
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.unitsService.findAll({
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('active')
  @Public()
  @ApiOperation({
    summary: 'Получить активные единицы измерения (публичный)',
    description: 'Получение списка активных единиц измерения. Доступно без авторизации.',
  })
  @ApiResponse({ status: 200, description: 'Список активных единиц измерения' })
  getActiveUnits() {
    return this.unitsService.getActiveUnits();
  }

  @Get(':id')
  @Roles('Administrator', 'Accountant')
  @ApiOperation({ summary: 'Получить единицу измерения по ID' })
  @ApiParam({ name: 'id', description: 'ID единицы измерения' })
  @ApiResponse({ status: 200, type: UnitResponseDto })
  @ApiResponse({ status: 404, description: 'Единица измерения не найдена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UnitResponseDto)
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Post()
  @Roles('Administrator')
  @ApiOperation({ summary: 'Создать единицу измерения (только администратор)' })
  @ApiResponse({ status: 201, type: UnitResponseDto })
  @ApiResponse({ status: 409, description: 'Единица измерения с таким кодом уже существует' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UnitResponseDto)
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }

  @Patch(':id')
  @Roles('Administrator')
  @ApiOperation({ summary: 'Обновить единицу измерения (только администратор)' })
  @ApiParam({ name: 'id', description: 'ID единицы измерения' })
  @ApiResponse({ status: 200, type: UnitResponseDto })
  @ApiResponse({ status: 404, description: 'Единица измерения не найдена' })
  @ApiResponse({ status: 409, description: 'Единица измерения с таким кодом уже существует' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UnitResponseDto)
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.unitsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrator')
  @ApiOperation({ summary: 'Деактивировать единицу измерения (только администратор)' })
  @ApiParam({ name: 'id', description: 'ID единицы измерения' })
  @ApiResponse({ status: 200, type: UnitResponseDto })
  @ApiResponse({ status: 404, description: 'Единица измерения не найдена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UnitResponseDto)
  deactivate(@Param('id') id: string) {
    return this.unitsService.deactivate(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrator')
  @ApiOperation({ summary: 'Активировать единицу измерения (только администратор)' })
  @ApiParam({ name: 'id', description: 'ID единицы измерения' })
  @ApiResponse({ status: 200, type: UnitResponseDto })
  @ApiResponse({ status: 404, description: 'Единица измерения не найдена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(UnitResponseDto)
  activate(@Param('id') id: string) {
    return this.unitsService.activate(id);
  }
}