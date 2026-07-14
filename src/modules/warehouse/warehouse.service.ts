import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database } from '../../database/database.interface';
import { IUser } from '../../common/interfaces/user.interface';
import { UpdateWarehouseSettingsDto } from './dto/update-warehouse-settings.dto';

@Injectable()
export class WarehouseService {
    constructor(
        @Inject('DB_CONNECTION') private readonly db: Kysely<Database>,
    ) { }

    async getSettings(warehouseId?: string) {
        let query = this.db
            .selectFrom('warehouses')
            .innerJoin('warehouseSettings', 'warehouses.id', 'warehouseSettings.warehouseId')
            .leftJoin('users', 'users.id', 'warehouseSettings.userUpdaterId')
            .select([
                'warehouseSettings.id',
                'warehouseSettings.warehouseId',
                'warehouses.name as warehouseName',
                'warehouseSettings.capacity',
                'warehouseSettings.currentOccupancy',
                'warehouseSettings.thresholdPercent',
                'warehouseSettings.userUpdaterId',
                'users.name as updaterName',
                'warehouseSettings.updatedAt',
                sql<number>`ROUND((${sql.raw('current_occupancy')}::DECIMAL / NULLIF(${sql.raw('capacity')}, 0)) * 100)`.as('occupancyPercent'),
                sql<boolean>`(
          (${sql.raw('current_occupancy')}::DECIMAL / NULLIF(${sql.raw('capacity')}, 0)) * 100 >= ${sql.raw('threshold_percent')}
        )`.as('isThresholdExceeded'),
            ]);

        if (warehouseId) {
            query = query.where('warehouseSettings.warehouseId', '=', warehouseId);
        }

        const result = await query
            .orderBy('warehouseSettings.updatedAt', 'desc')
            .execute();

        if (result.length === 0) {
            throw new NotFoundException('Настройки склада не найдены');
        }

        return result.map((row) => ({
            id: row.id,
            warehouseId: row.warehouseId,
            warehouseName: (row as any).warehouseName,
            capacity: row.capacity,
            currentOccupancy: row.currentOccupancy,
            occupancyPercent: Number((row as any).occupancyPercent) || 0,
            thresholdPercent: row.thresholdPercent,
            isThresholdExceeded: Boolean((row as any).isThresholdExceeded),
            userUpdaterId: row.userUpdaterId,
            updaterName: (row as any).updaterName || 'Система',
            updatedAt: row.updatedAt,
        }));
    }

    async updateSettings(warehouseId: string, dto: UpdateWarehouseSettingsDto, user: IUser) {
        const warehouse = await this.db
            .selectFrom('warehouses')
            .select('id')
            .where('id', '=', warehouseId)
            .executeTakeFirst();

        if (!warehouse) {
            throw new NotFoundException('Склад не найден');
        }

        const current = await this.db
            .selectFrom('warehouseSettings')
            .select(['capacity', 'currentOccupancy', 'thresholdPercent'])
            .where('warehouseId', '=', warehouseId)
            .orderBy('updatedAt', 'desc')
            .executeTakeFirst();

        if (!current) {
            throw new NotFoundException('Настройки склада не найдены');
        }

        const newCapacity = dto.capacity ?? current.capacity;
        const newThreshold = dto.thresholdPercent ?? current.thresholdPercent;

        if (dto.capacity && dto.capacity < current.currentOccupancy) {
            throw new BadRequestException(
                `Новая вместимость (${dto.capacity}) не может быть меньше текущей занятости (${current.currentOccupancy})`,
            );
        }

        await this.db
            .insertInto('warehouseSettings')
            .values({
                id: sql`gen_random_uuid()`,
                warehouseId: warehouseId,
                capacity: newCapacity,
                currentOccupancy: current.currentOccupancy,
                thresholdPercent: newThreshold,
                userUpdaterId: user.id,
                updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .execute();

        const result = await this.getSettings(warehouseId);

        const settings = result.find((s) => s.warehouseId === warehouseId);
        if (settings && settings.isThresholdExceeded) {
            console.log(` Внимание! Занятость склада "${settings.warehouseName}" превышает ${settings.thresholdPercent}%`);
            console.log(` Текущая занятость: ${settings.occupancyPercent}% (${settings.currentOccupancy}/${settings.capacity})`);
        }

        return settings;
    }

    async getHistory(warehouseId: string, params: { limit?: number; offset?: number }) {
        const { limit = 20, offset = 0 } = params;

        const warehouse = await this.db
            .selectFrom('warehouses')
            .select('id')
            .where('id', '=', warehouseId)
            .executeTakeFirst();

        if (!warehouse) {
            throw new NotFoundException('Склад не найден');
        }

        const data = await this.db
            .selectFrom('warehouseSettings')
            .innerJoin('warehouses', 'warehouses.id', 'warehouseSettings.warehouseId')
            .leftJoin('users', 'users.id', 'warehouseSettings.userUpdaterId')
            .select([
                'warehouseSettings.id',
                'warehouseSettings.warehouseId',
                'warehouses.name as warehouseName',
                'warehouseSettings.capacity',
                'warehouseSettings.currentOccupancy',
                'warehouseSettings.thresholdPercent',
                'warehouseSettings.userUpdaterId',
                'users.name as updaterName',
                'warehouseSettings.updatedAt',
            ])
            .where('warehouseSettings.warehouseId', '=', warehouseId)
            .orderBy('warehouseSettings.updatedAt', 'desc')
            .offset(offset)
            .limit(limit)
            .execute();

        const countResult = await this.db
            .selectFrom('warehouseSettings')
            .select((eb) => eb.fn.count('id').as('count'))
            .where('warehouseId', '=', warehouseId)
            .executeTakeFirst();

        const total = Number((countResult as any)?.count || 0);

        return {
            data: data.map((row) => ({
                id: row.id,
                warehouseId: row.warehouseId,
                warehouseName: (row as any).warehouseName,
                capacity: row.capacity,
                currentOccupancy: row.currentOccupancy,
                thresholdPercent: row.thresholdPercent,
                userUpdaterId: row.userUpdaterId,
                updaterName: (row as any).updaterName || 'Система',
                updatedAt: row.updatedAt,
            })),
            total,
            limit,
            offset,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getAllWarehouses() {
        const warehouses = await this.db
            .selectFrom('warehouses')
            .select(['id', 'name', 'address', 'description', 'createdAt', 'updatedAt'])
            .orderBy('name')
            .execute();

        return warehouses;
    }

    async getWarehouseOccupancyStats(warehouseId?: string) {
        let query = this.db
            .selectFrom('warehouseSettings')
            .innerJoin('warehouses', 'warehouses.id', 'warehouseSettings.warehouseId')
            .select([
                'warehouseSettings.warehouseId',
                'warehouses.name as warehouseName',
                'warehouseSettings.capacity',
                'warehouseSettings.currentOccupancy',
                'warehouseSettings.thresholdPercent',
                sql<number>`ROUND((${sql.raw('current_occupancy')}::DECIMAL / NULLIF(${sql.raw('capacity')}, 0)) * 100)`.as('occupancyPercent'),
            ])
            .distinctOn('warehouseSettings.warehouseId')
            .orderBy('warehouseSettings.warehouseId')
            .orderBy('warehouseSettings.updatedAt', 'desc');

        if (warehouseId) {
            query = query.where('warehouseSettings.warehouseId', '=', warehouseId);
        }

        const result = await query.execute();

        return result.map((row) => ({
            warehouseId: row.warehouseId,
            warehouseName: (row as any).warehouseName,
            capacity: row.capacity,
            currentOccupancy: row.currentOccupancy,
            occupancyPercent: Number((row as any).occupancyPercent) || 0,
            thresholdPercent: row.thresholdPercent,
            freeSpace: row.capacity - row.currentOccupancy,
        }));
    }
}