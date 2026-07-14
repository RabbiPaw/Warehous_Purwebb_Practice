import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database } from '../../database/database.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('DB_CONNECTION') private readonly db: Kysely<Database>,
  ) {}

  async findAll(params: { search?: string; unitId?: string; isActive?: boolean }) {
    const { search, unitId, isActive } = params;

    let query = this.db
      .selectFrom('products')
      .innerJoin('units', 'units.id', 'products.unitId')
      .select([
        'products.id',
        'products.name',
        'products.description',
        'products.unitId',
        'units.name as unitName',
        'units.code as unitCode',
        'products.isActive',
        'products.createdAt',
        'products.updatedAt',
      ]);

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('products.name', 'ilike', `%${search}%`),
          eb('products.description', 'ilike', `%${search}%`),
        ])
      );
    }

    if (unitId) {
      query = query.where('products.unitId', '=', unitId);
    }

    if (isActive !== undefined) {
      query = query.where('products.isActive', '=', isActive);
    }

    const result = await query
      .orderBy('products.name')
      .execute();

    return result;
  }

  async findOne(id: string) {
    const product = await this.db
      .selectFrom('products')
      .innerJoin('units', 'units.id', 'products.unitId')
      .select([
        'products.id',
        'products.name',
        'products.description',
        'products.unitId',
        'units.name as unitName',
        'units.code as unitCode',
        'products.isActive',
        'products.createdAt',
        'products.updatedAt',
      ])
      .where('products.id', '=', id)
      .executeTakeFirst();

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const unit = await this.db
      .selectFrom('units')
      .select('id')
      .where('id', '=', dto.unitId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!unit) {
      throw new BadRequestException('Единица измерения не найдена или неактивна');
    }

    const product = await this.db
      .insertInto('products')
      .values({
        id: sql`gen_random_uuid()`,
        name: dto.name,
        description: dto.description || null,
        unitId: dto.unitId,
        isActive: dto.isActive ?? true,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning('id')
      .executeTakeFirst();

    if (!product) {
      throw new BadRequestException('Не удалось создать товар');
    }

    return this.findOne(product.id);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.db
      .selectFrom('products')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Товар не найден');
    }

    if (dto.unitId) {
      const unit = await this.db
        .selectFrom('units')
        .select('id')
        .where('id', '=', dto.unitId)
        .where('isActive', '=', true)
        .executeTakeFirst();

      if (!unit) {
        throw new BadRequestException('Единица измерения не найдена или неактивна');
      }
    }

    const updateData: any = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.unitId !== undefined) updateData.unitId = dto.unitId;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.db
      .updateTable('products')
      .set(updateData)
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async deactivate(id: string) {
    const existing = await this.db
      .selectFrom('products')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Товар не найден');
    }

    await this.db
      .updateTable('products')
      .set({
        isActive: false,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async activate(id: string) {
    const existing = await this.db
      .selectFrom('products')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Товар не найден');
    }

    await this.db
      .updateTable('products')
      .set({
        isActive: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }
}