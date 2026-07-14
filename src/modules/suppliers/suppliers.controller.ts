import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery} from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Serialize } from '../../common/decorators/serialize.decorator';

@ApiTags('suppliers')
@Controller('suppliers')
@ApiBearerAuth('JWT-auth')
@Roles('Administrator', 'Accountant')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список поставщиков',
    description: 'Получение списка всех поставщиков с фильтрами. Доступно для администратора и бухгалтера.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию или ИНН' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Фильтр по активности' })
  @ApiResponse({ status: 200, type: [SupplierResponseDto] })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(SupplierResponseDto)
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.suppliersService.findAll({
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить поставщика по ID' })
  @ApiParam({ name: 'id', description: 'ID поставщика' })
  @ApiResponse({ status: 200, type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Поставщик не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(SupplierResponseDto)
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать поставщика' })
  @ApiResponse({ status: 201, type: SupplierResponseDto })
  @ApiResponse({ status: 409, description: 'Поставщик с таким ИНН уже существует' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(SupplierResponseDto)
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить поставщика' })
  @ApiParam({ name: 'id', description: 'ID поставщика' })
  @ApiResponse({ status: 200, type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Поставщик не найден' })
  @ApiResponse({ status: 409, description: 'Поставщик с таким ИНН уже существует' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(SupplierResponseDto)
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Деактивировать поставщика (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID поставщика' })
  @ApiResponse({ status: 200, type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Поставщик не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(SupplierResponseDto)
  deactivate(@Param('id') id: string) {
    return this.suppliersService.deactivate(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Активировать поставщика' })
  @ApiParam({ name: 'id', description: 'ID поставщика' })
  @ApiResponse({ status: 200, type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Поставщик не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(SupplierResponseDto)
  activate(@Param('id') id: string) {
    return this.suppliersService.activate(id);
  }
}