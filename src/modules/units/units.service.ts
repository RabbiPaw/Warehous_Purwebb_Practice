import { Injectable, Inject, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database } from '../../database/database.interface';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @Inject('DB_CONNECTION') private readonly db: Kysely<Database>,
  ) {}

  async findAll(params: { search?: string; isActive?: boolean }) {
    const { search, isActive } = params;

    let query = this.db
      .selectFrom('units')
      .select([
        'id',
        'code',
        'name',
        'description',
        'sortOrder',
        'isActive',
        'createdAt',
        'updatedAt',
      ]);

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('code', 'ilike', `%${search}%`),
          eb('name', 'ilike', `%${search}%`),
        ])
      );
    }

    if (isActive !== undefined) {
      query = query.where('isActive', '=', isActive);
    }

    const result = await query
      .orderBy('sortOrder')
      .execute();

    return result;
  }

  async findOne(id: string) {
    const unit = await this.db
      .selectFrom('units')
      .select([
        'id',
        'code',
        'name',
        'description',
        'sortOrder',
        'isActive',
        'createdAt',
        'updatedAt',
      ])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!unit) {
      throw new NotFoundException('Единица измерения не найдена');
    }

    return unit;
  }

  async create(dto: CreateUnitDto) {
    const existing = await this.db
      .selectFrom('units')
      .select('id')
      .where('code', '=', dto.code)
      .executeTakeFirst();

    if (existing) {
      throw new ConflictException('Единица измерения с таким кодом уже существует');
    }

    const unit = await this.db
      .insertInto('units')
      .values({
        id: sql`gen_random_uuid()`,
        code: dto.code,
        name: dto.name,
        description: dto.description || null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning('id')
      .executeTakeFirst();

    if (!unit) {
      throw new BadRequestException('Не удалось создать единицу измерения');
    }

    return this.findOne(unit.id);
  }

  async update(id: string, dto: UpdateUnitDto) {
    const existing = await this.db
      .selectFrom('units')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Единица измерения не найдена');
    }

    if (dto.code) {
      const duplicate = await this.db
        .selectFrom('units')
        .select('id')
        .where('code', '=', dto.code)
        .where('id', '!=', id)
        .executeTakeFirst();

      if (duplicate) {
        throw new ConflictException('Единица измерения с таким кодом уже существует');
      }
    }

    const updateData: any = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.db
      .updateTable('units')
      .set(updateData)
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async deactivate(id: string) {
    const existing = await this.db
      .selectFrom('units')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Единица измерения не найдена');
    }

    await this.db
      .updateTable('units')
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
      .selectFrom('units')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Единица измерения не найдена');
    }

    await this.db
      .updateTable('units')
      .set({
        isActive: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async getActiveUnits() {
    const units = await this.db
      .selectFrom('units')
      .select(['id', 'code', 'name'])
      .where('isActive', '=', true)
      .orderBy('sortOrder')
      .execute();

    return units;
  }
}