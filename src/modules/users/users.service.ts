import { Injectable, Inject, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database } from '../../database/database.interface';
import { IUser } from '../../common/interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DB_CONNECTION') private readonly db: Kysely<Database>,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 20, search, role, isActive } = params;
    const offset = (page - 1) * limit;

    let query = this.db
      .selectFrom('users')
      .innerJoin('roles', 'roles.id', 'users.roleId')
      .select([
        'users.id',
        'users.email',
        'users.name',
        'users.surname',
        'users.patronymic',
        'users.roleId',
        'users.isActive',
        'users.lastLoginAt',
        'users.createdAt',
        'users.updatedAt',
        'roles.name as roleName',
      ]);

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('users.email', 'ilike', `%${search}%`),
          eb('users.name', 'ilike', `%${search}%`),
          eb('users.surname', 'ilike', `%${search}%`),
        ])
      );
    }

    if (role) {
      query = query.where('roles.name', '=', role);
    }

    if (isActive !== undefined) {
      query = query.where('users.isActive', '=', isActive);
    }

    const data = await query
      .orderBy('users.createdAt', 'desc')
      .offset(offset)
      .limit(limit)
      .execute();

    let countQuery = this.db
      .selectFrom('users')
      .innerJoin('roles', 'roles.id', 'users.roleId')
      .select((eb) => eb.fn.count('users.id').as('count'));

    if (search) {
      countQuery = countQuery.where((eb) =>
        eb.or([
          eb('users.email', 'ilike', `%${search}%`),
          eb('users.name', 'ilike', `%${search}%`),
          eb('users.surname', 'ilike', `%${search}%`),
        ])
      );
    }

    if (role) {
      countQuery = countQuery.where('roles.name', '=', role);
    }

    if (isActive !== undefined) {
      countQuery = countQuery.where('users.isActive', '=', isActive);
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = Number((countResult as any)?.count || 0);

    const users: IUser[] = data.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      roleId: user.roleId,
      roleName: (user as any).roleName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.db
      .selectFrom('users')
      .innerJoin('roles', 'roles.id', 'users.roleId')
      .select([
        'users.id',
        'users.email',
        'users.name',
        'users.surname',
        'users.patronymic',
        'users.roleId',
        'users.isActive',
        'users.lastLoginAt',
        'users.createdAt',
        'users.updatedAt',
        'roles.name as roleName',
      ])
      .where('users.id', '=', id)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      roleId: user.roleId,
      roleName: (user as any).roleName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.db
      .selectFrom('users')
      .select('id')
      .where('email', '=', dto.email)
      .executeTakeFirst();

    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    let roleId = dto.roleId;
    if (!roleId) {
      const defaultRole = await this.db
        .selectFrom('roles')
        .select('id')
        .where('name', '=', 'Unknown')
        .where('isActive', '=', true)
        .executeTakeFirst();

      if (!defaultRole) {
        throw new BadRequestException('Роль по умолчанию не найдена');
      }
      roleId = defaultRole.id;
    } else {
      const roleExists = await this.db
        .selectFrom('roles')
        .select('id')
        .where('id', '=', roleId)
        .where('isActive', '=', true)
        .executeTakeFirst();

      if (!roleExists) {
        throw new BadRequestException('Указанная роль не найдена или неактивна');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.db
      .insertInto('users')
      .values({
        id: sql`gen_random_uuid()`,
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        surname: dto.surname,
        patronymic: dto.patronymic || null,
        roleId: roleId,
        isActive: true,
        lastLoginAt: sql`CURRENT_TIMESTAMP`,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning('id')
      .executeTakeFirst();

    if (!user) {
      throw new BadRequestException('Не удалось создать пользователя');
    }

    return this.findOne(user.id);
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.db
      .selectFrom('users')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (dto.roleId) {
      const roleExists = await this.db
        .selectFrom('roles')
        .select('id')
        .where('id', '=', dto.roleId)
        .where('isActive', '=', true)
        .executeTakeFirst();

      if (!roleExists) {
        throw new BadRequestException('Указанная роль не найдена или неактивна');
      }
    }

    const updateData: any = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.surname !== undefined) updateData.surname = dto.surname;
    if (dto.patronymic !== undefined) updateData.patronymic = dto.patronymic;
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.db
      .updateTable('users')
      .set(updateData)
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async updateRole(id: string, roleId: string) {
    const user = await this.db
      .selectFrom('users')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const role = await this.db
      .selectFrom('roles')
      .select('id')
      .where('id', '=', roleId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!role) {
      throw new BadRequestException('Роль не найдена или неактивна');
    }

    await this.db
      .updateTable('users')
      .set({
        roleId: roleId,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async toggleActive(id: string) {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'isActive'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.db
      .updateTable('users')
      .set({
        isActive: !user.isActive,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async deactivate(id: string) {
    const user = await this.db
      .selectFrom('users')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.db
      .updateTable('users')
      .set({
        isActive: false,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async activate(id: string) {
    const user = await this.db
      .selectFrom('users')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.db
      .updateTable('users')
      .set({
        isActive: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', id)
      .execute();

    return this.findOne(id);
  }

  async getWarehouses(userId: string) {
    const user = await this.db
      .selectFrom('users')
      .select('id')
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const warehouses = await this.db
      .selectFrom('userWarehouses')
      .innerJoin('warehouses', 'warehouses.id', 'userWarehouses.warehouseId')
      .select([
        'warehouses.id',
        'warehouses.name',
        'warehouses.address',
        'warehouses.description',
        'userWarehouses.grantedAt',
        'userWarehouses.grantedBy',
      ])
      .where('userWarehouses.userId', '=', userId)
      .execute();

    return warehouses;
  }

  async grantWarehouseAccess(userId: string, warehouseId: string, adminId: string) {
    const user = await this.db
      .selectFrom('users')
      .select('id')
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const warehouse = await this.db
      .selectFrom('warehouses')
      .select('id')
      .where('id', '=', warehouseId)
      .executeTakeFirst();

    if (!warehouse) {
      throw new BadRequestException('Склад не найден');
    }

    const existing = await this.db
      .selectFrom('userWarehouses')
      .select('id')
      .where('userId', '=', userId)
      .where('warehouseId', '=', warehouseId)
      .executeTakeFirst();

    if (existing) {
      throw new ConflictException('Доступ к этому складу уже предоставлен');
    }

    await this.db
      .insertInto('userWarehouses')
      .values({
        id: sql`gen_random_uuid()`,
        userId: userId,
        warehouseId: warehouseId,
        grantedAt: sql`CURRENT_TIMESTAMP`,
        grantedBy: adminId,
        createdAt: sql`CURRENT_TIMESTAMP`,
      })
      .execute();

    return this.getWarehouses(userId);
  }

  async revokeWarehouseAccess(userId: string, warehouseId: string) {
    const user = await this.db
      .selectFrom('users')
      .select('id')
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existing = await this.db
      .selectFrom('userWarehouses')
      .select('id')
      .where('userId', '=', userId)
      .where('warehouseId', '=', warehouseId)
      .executeTakeFirst();

    if (!existing) {
      throw new BadRequestException('Доступ к этому складу не найден');
    }

    await this.db
      .deleteFrom('userWarehouses')
      .where('userId', '=', userId)
      .where('warehouseId', '=', warehouseId)
      .execute();

    return this.getWarehouses(userId);
  }

  async getAllRoles() {
    const roles = await this.db
      .selectFrom('roles')
      .select(['id', 'name', 'description', 'isActive', 'sortOrder'])
      .where('isActive', '=', true)
      .orderBy('sortOrder')
      .execute();

    return roles;
  }
}