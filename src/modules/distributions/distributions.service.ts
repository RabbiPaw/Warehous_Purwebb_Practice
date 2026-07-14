import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database } from '../../database/database.interface';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { DistributionQueryDto } from './dto/distribution-query.dto';
import { IUser } from '../../common/interfaces/user.interface';

export enum DistributionType {
  INCOME = 'Supply',
  OUTCOME = 'WriteOff',
  DEFECT = 'Defect',
  ADJUSTMENT = 'Adjustment',
}

@Injectable()
export class DistributionsService {
  constructor(
    @Inject('DB_CONNECTION') private readonly db: Kysely<Database>,
  ) {}

  async createIncome(dto: CreateDistributionDto, user: IUser) {
    const distributionType = await this.getDistributionType(DistributionType.INCOME);
    return this.createDistribution(dto, user, distributionType.id);
  }

  async createOutcome(dto: CreateDistributionDto, user: IUser) {
    await this.checkStock(dto.productId, dto.warehouseId, dto.quantity);
    const distributionType = await this.getDistributionType(DistributionType.OUTCOME);
    return this.createDistribution(dto, user, distributionType.id);
  }

  async createDefect(dto: CreateDistributionDto, user: IUser) {
    await this.checkStock(dto.productId, dto.warehouseId, dto.quantity);
    const distributionType = await this.getDistributionType(DistributionType.DEFECT);
    return this.createDistribution(dto, user, distributionType.id);
  }

  async createAdjustment(dto: CreateDistributionDto, user: IUser) {
    if (dto.quantity < 0) {
      await this.checkStock(dto.productId, dto.warehouseId, Math.abs(dto.quantity));
    }
    const distributionType = await this.getDistributionType(DistributionType.ADJUSTMENT);
    return this.createDistribution(dto, user, distributionType.id);
  }

  async findAllWithCursor(query: DistributionQueryDto) {
    const {
      cursor,
      limit = 20,
      productId,
      warehouseId,
      fromDate,
      toDate,
    } = query;

    let baseQuery = this.db
      .selectFrom('distributions')
      .innerJoin('users', 'users.id', 'distributions.userId')
      .innerJoin('distributionTypes', 'distributionTypes.id', 'distributions.distributionTypeId')
      .innerJoin('products', 'products.id', 'distributions.productId')
      .innerJoin('suppliers', 'suppliers.id', 'distributions.supplierId')
      .innerJoin('warehouses', 'warehouses.id', 'distributions.warehouseId')
      .innerJoin('units', 'units.id', 'distributions.unitId')
      .select([
        'distributions.id',
        'distributions.userId',
        'users.name as userName',
        'distributions.distributionTypeId',
        'distributionTypes.name as distributionTypeName',
        'distributionTypes.sign',
        'distributions.productId',
        'products.name as productName',
        'distributions.supplierId',
        'suppliers.name as supplierName',
        'distributions.warehouseId',
        'warehouses.name as warehouseName',
        'distributions.distributionDate',
        'distributions.quantity',
        'distributions.unitId',
        'units.code as unitCode',
        'distributions.description',
        'distributions.createdAt',
      ]);

    if (productId) {
      baseQuery = baseQuery.where('distributions.productId', '=', productId);
    }

    if (warehouseId) {
      baseQuery = baseQuery.where('distributions.warehouseId', '=', warehouseId);
    }

    if (fromDate) {
      baseQuery = baseQuery.where('distributions.distributionDate', '>=', new Date(fromDate));
    }

    if (toDate) {
      baseQuery = baseQuery.where('distributions.distributionDate', '<=', new Date(toDate));
    }

    if (cursor) {
      const lastItem = await this.db
        .selectFrom('distributions')
        .select(['distributionDate', 'id'])
        .where('id', '=', cursor)
        .executeTakeFirst();

      if (lastItem) {
        baseQuery = baseQuery.where((eb) =>
          eb.or([
            eb('distributions.distributionDate', '<', lastItem.distributionDate),
            eb.and([
              eb('distributions.distributionDate', '=', lastItem.distributionDate),
              eb('distributions.id', '<', lastItem.id),
            ]),
          ])
        );
      }
    }

    const data = await baseQuery
      .orderBy('distributions.distributionDate', 'desc')
      .orderBy('distributions.id', 'desc')
      .limit(limit + 1)
      .execute();

    const hasMore = data.length > limit;
    const resultData = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? resultData[resultData.length - 1]?.id : null;

    let countQuery = this.db
      .selectFrom('distributions')
      .select((eb) => eb.fn.count('distributions.id').as('count'));

    if (productId) {
      countQuery = countQuery.where('distributions.productId', '=', productId);
    }

    if (warehouseId) {
      countQuery = countQuery.where('distributions.warehouseId', '=', warehouseId);
    }

    if (fromDate) {
      countQuery = countQuery.where('distributions.distributionDate', '>=', new Date(fromDate));
    }

    if (toDate) {
      countQuery = countQuery.where('distributions.distributionDate', '<=', new Date(toDate));
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = Number((countResult as any)?.count || 0);

    return {
      data: resultData,
      nextCursor,
      limit,
      total,
      hasMore,
    };
  }

  async findOne(id: string) {
    const distribution = await this.db
      .selectFrom('distributions')
      .innerJoin('users', 'users.id', 'distributions.userId')
      .innerJoin('distributionTypes', 'distributionTypes.id', 'distributions.distributionTypeId')
      .innerJoin('products', 'products.id', 'distributions.productId')
      .innerJoin('suppliers', 'suppliers.id', 'distributions.supplierId')
      .innerJoin('warehouses', 'warehouses.id', 'distributions.warehouseId')
      .innerJoin('units', 'units.id', 'distributions.unitId')
      .select([
        'distributions.id',
        'distributions.userId',
        'users.name as userName',
        'distributions.distributionTypeId',
        'distributionTypes.name as distributionTypeName',
        'distributionTypes.sign',
        'distributions.productId',
        'products.name as productName',
        'distributions.supplierId',
        'suppliers.name as supplierName',
        'distributions.warehouseId',
        'warehouses.name as warehouseName',
        'distributions.distributionDate',
        'distributions.quantity',
        'distributions.unitId',
        'units.code as unitCode',
        'distributions.description',
        'distributions.createdAt',
        'distributions.updatedAt',
      ])
      .where('distributions.id', '=', id)
      .executeTakeFirst();

    if (!distribution) {
      throw new BadRequestException('Distribution not found');
    }

    return distribution;
  }

  async getStock(productId: string, warehouseId?: string) {
    let query = this.db
      .selectFrom('distributions')
      .innerJoin('distributionTypes', 'distributionTypes.id', 'distributions.distributionTypeId')
      .innerJoin('products', 'products.id', 'distributions.productId')
      .innerJoin('units', 'units.id', 'distributions.unitId')
      .innerJoin('warehouses', 'warehouses.id', 'distributions.warehouseId')
      .select([
        'distributions.productId',
        'products.name as productName',
        'distributions.unitId',
        'units.code as unitCode',
        'distributions.warehouseId',
        'warehouses.name as warehouseName',
        sql<number>`SUM(distributions.quantity * distributionTypes.sign)`.as('totalQuantity'),
      ])
      .where('distributions.productId', '=', productId)
      .groupBy([
        'distributions.productId',
        'products.name',
        'distributions.unitId',
        'units.code',
        'distributions.warehouseId',
        'warehouses.name',
      ]);

    if (warehouseId) {
      query = query.where('distributions.warehouseId', '=', warehouseId);
    }

    const result = await query.execute();

    return result.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      unitId: row.unitId,
      unitCode: row.unitCode,
      warehouseId: row.warehouseId,
      warehouseName: row.warehouseName,
      totalQuantity: Number((row as any).totalQuantity) || 0,
    }));
  }

  async getProductHistoryWithCursor(
    productId: string,
    query: Omit<DistributionQueryDto, 'productId'>,
  ) {
    return this.findAllWithCursor({
      ...query,
      productId,
    });
  }

  private async getDistributionType(name: string) {
    const type = await this.db
      .selectFrom('distributionTypes')
      .select(['id', 'sign'])
      .where('name', '=', name)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!type) {
      throw new BadRequestException(`Distribution type "${name}" not found`);
    }

    return type;
  }

  private async checkStock(productId: string, warehouseId: string, quantity: number) {
    const stock = await this.getStock(productId, warehouseId);
    const currentStock = stock.reduce((sum, item) => sum + item.totalQuantity, 0);

    if (currentStock < quantity) {
      throw new BadRequestException(
        `Not enough stock. Available: ${currentStock}, Required: ${quantity}`,
      );
    }

    return currentStock;
  }

  private async createDistribution(
    dto: CreateDistributionDto,
    user: IUser,
    distributionTypeId: string,
  ) {
    await this.validateRelatedRecords(dto);

    const distributionDate = dto.distributionDate ? new Date(dto.distributionDate) : new Date();

    const result = await this.db
      .insertInto('distributions')
      .values({
        id: sql`gen_random_uuid()`,
        userId: user.id,
        distributionTypeId: distributionTypeId,
        productId: dto.productId,
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
        distributionDate: distributionDate,
        quantity: dto.quantity,
        unitId: dto.unitId,
        description: dto.description || null,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning('id')
      .executeTakeFirst();

    if (!result) {
      throw new BadRequestException('Failed to create distribution');
    }

    return this.findOne(result.id);
  }

  private async validateRelatedRecords(dto: CreateDistributionDto) {
    const product = await this.db
      .selectFrom('products')
      .select('id')
      .where('id', '=', dto.productId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!product) {
      throw new BadRequestException('Product not found or inactive');
    }

    const supplier = await this.db
      .selectFrom('suppliers')
      .select('id')
      .where('id', '=', dto.supplierId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!supplier) {
      throw new BadRequestException('Supplier not found or inactive');
    }

    const warehouse = await this.db
      .selectFrom('warehouses')
      .select('id')
      .where('id', '=', dto.warehouseId)
      .executeTakeFirst();

    if (!warehouse) {
      throw new BadRequestException('Warehouse not found');
    }

    const unit = await this.db
      .selectFrom('units')
      .select('id')
      .where('id', '=', dto.unitId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!unit) {
      throw new BadRequestException('Unit not found or inactive');
    }
  }
}