import { Injectable, Inject, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database } from '../../database/database.interface';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @Inject('DB_CONNECTION') private readonly db: Kysely<Database>,
  ) {}

  async findAll(params: { search?: string; isActive?: boolean }) {
    const { search, isActive } = params;

    let query = this.db
      .selectFrom('suppliers')
      .select([
        'id',
        'name',
        'inn',
        'contact',
        'isActive',
        'createdAt',
        'updatedAt',
      ]);

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('name', 'ilike', `%${search}%`),
          eb('inn', 'ilike', `%${search}%`),
        ])
      );
    }

    if (isActive !== undefined) {
      query = query.where('isActive', '=', isActive);
    }

    const result = await query
      .orderBy('name')
      .execute();

    return result;
  }

  async findOne(id: string) {
    const supplier = await this.db
      .selectFrom('suppliers')
      .select([
        'id',
        'name',
        'inn',
        'contact',
        'isActive',
        'createdAt',
        'updatedAt',
      ])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!supplier) {
      throw new NotFoundException('Поставщик не найден');
    }

    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const existing = await this.db
      .selectFrom('suppliers')
      .select('id')
      .where('inn', '=', dto.inn)
      .executeTakeFirst();

    if (existing) {
      throw new ConflictException('Поставщик с таким ИНН уже существует');
    }

    const supplier = await this.db
      .insertInto('suppliers')
      .values({
        id: sql`gen_random_uuid()`,
        name: dto.name,
        inn: dto.inn,
        contact: dto.contact || null,
        isActive: dto.isActive ?? true,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning('id')
      .executeTakeFirst();

    if (!supplier) {
      throw new BadRequestException('Не удалось создать поставщика');
    }

    return this.findOne(supplier.id);
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const existing = await this.db
      .selectFrom('suppliers')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Поставщик не найден');
    }

    if (dto.inn) {
      const duplicate = await this.db
        .selectFrom('suppliers')
        .select('id')
        .where('inn', '=', dto.inn)
        .where('id', '!=', id)
        .executeTakeFirst();

      if (duplicate) {
        throw new ConflictException('Поставщик с таким ИНН уже существует');
      }
    }

    const updateData: any = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.inn !== undefined) updateData.inn = dto.inn;
    if (dto.contact !== undefined) updateData.contact = dto.contact;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.db
      .updateTable('suppliers')
      .set(updateData)
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async deactivate(id: string) {
    const existing = await this.db
      .selectFrom('suppliers')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Поставщик не найден');
    }

    await this.db
      .updateTable('suppliers')
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
      .selectFrom('suppliers')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Поставщик не найден');
    }

    await this.db
      .updateTable('suppliers')
      .set({
        isActive: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }
}