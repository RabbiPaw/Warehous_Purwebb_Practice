import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database, UsersTable } from '../database.interface';
import { IUser } from '../../common/interfaces/user.interface';

export interface IUserWithPassword extends IUser {
  password: string;
}

@Injectable()
export class UsersRepository {
  constructor(
    @Inject('DB_CONNECTION') private readonly db: Kysely<Database>,
  ) {}

  async findByIdWithRole(id: string): Promise<IUser | null> {
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

    if (!user) return null;

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

  async findByEmail(email: string): Promise<UsersTable | null> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) return null;

    return user;
  }

  async findByEmailWithRole(email: string): Promise<IUserWithPassword | null> {
    const user = await this.db
      .selectFrom('users')
      .innerJoin('roles', 'roles.id', 'users.roleId')
      .select([
        'users.id',
        'users.email',
        'users.password',
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
      .where('users.email', '=', email)
      .executeTakeFirst();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
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

  async create(
    data: Omit<UsersTable, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>,
  ): Promise<UsersTable> {
    const user = await this.db
      .insertInto('users')
      .values({
        id: sql`gen_random_uuid()`,
        email: data.email,
        password: data.password,
        name: data.name,
        surname: data.surname,
        patronymic: data.patronymic,
        roleId: data.roleId,
        isActive: data.isActive,
        lastLoginAt: sql`CURRENT_TIMESTAMP`,
      })
      .returningAll()
      .executeTakeFirst();

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ 
        lastLoginAt: sql`CURRENT_TIMESTAMP`
      })
      .where('id', '=', id)
      .execute();
  }

  async getDefaultRoleId(): Promise<string | null> {
    const role = await this.db
      .selectFrom('roles')
      .select('id')
      .where('name', '=', 'Unknown')
      .where('isActive', '=', true)
      .executeTakeFirst();

    return role?.id || null;
  }

  async updateRole(userId: string, roleId: string): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ 
        roleId: roleId,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', userId)
      .execute();
  }

  async deactivate(userId: string): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ 
        isActive: false,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', userId)
      .execute();
  }

  async activate(userId: string): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ 
        isActive: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where('id', '=', userId)
      .execute();
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<{ data: IUser[]; total: number }> {
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

    // Фильтры
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

    // Подсчет общего количества
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
    const total = Number((countResult as any)?.count || 0); // todo: проверить возвращение, обдумать момент

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

    return { data: users, total };
  }
}