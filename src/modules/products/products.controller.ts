import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Serialize } from '../../common/decorators/serialize.decorator';

@ApiTags('products')
@Controller('products')
@ApiBearerAuth('JWT-auth')
@Roles('Administrator', 'Accountant')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список товаров',
    description: 'Получение списка всех товаров с фильтрами. Доступно для администратора и бухгалтера.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию или описанию' })
  @ApiQuery({ name: 'unitId', required: false, description: 'Фильтр по единице измерения' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Фильтр по активности' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(ProductResponseDto)
  findAll(
    @Query('search') search?: string,
    @Query('unitId') unitId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.productsService.findAll({
      search,
      unitId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiParam({ name: 'id', description: 'ID товара' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(ProductResponseDto)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать товар' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(ProductResponseDto)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить товар' })
  @ApiParam({ name: 'id', description: 'ID товара' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(ProductResponseDto)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Деактивировать товар (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID товара' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(ProductResponseDto)
  deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Активировать товар' })
  @ApiParam({ name: 'id', description: 'ID товара' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Serialize(ProductResponseDto)
  activate(@Param('id') id: string) {
    return this.productsService.activate(id);
  }
}