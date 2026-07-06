import { ColumnType } from 'kysely';

export interface Database {
  users: UsersTable;
  roles: RolesTable;
  products: ProductsTable;
  suppliers: SuppliersTable;
  distributions: DistributionsTable;
  distributionTypes: DistributionTypesTable;
  units: UnitsTable;
  warehouses: WarehousesTable;
  warehouseSettings: WarehouseSettingsHistoryTable;
  userWarehouses: UserWarehousesTable;
}

export interface UsersTable {
  id: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  patronymic: string | null;
  roleId: string;
  isActive: boolean;
  lastLoginAt: ColumnType<Date, Date | null, Date | null>;
  createdAt: ColumnType<Date, Date | null, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface RolesTable {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: ColumnType<Date, Date | null, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface ProductsTable {
  id: string;
  name: string;
  description: string | null;
  unitId: string;
  createdAt: ColumnType<Date, Date | null, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface SuppliersTable {
  id: string;
  name: string;
  inn: string;
  isActive: boolean;
  contact: string | null;
  createdAt: ColumnType<Date, Date | null, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface DistributionsTable {
  id: string;
  userId: string;
  distributionTypeId: string;
  productId: string;
  supplierId: string;
  warehouseId: string;
  distributionDate: ColumnType<Date, Date, never>;
  quantity: number;
  unitId: string;
  description: string | null;
  createdAt: ColumnType<Date, Date | null, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface DistributionTypesTable {
  id: string;
  name: string;
  description: string | null;
  sign: number;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: ColumnType<Date, Date | null, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface UnitsTable {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: ColumnType<Date, Date | null, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface WarehousesTable {
  id: string;
  name: string;
  isActive: boolean;
  address: string;
  description: string | null;
  createdAt: ColumnType<Date, Date | null, never>;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface WarehouseSettingsHistoryTable {
  id: string;
  warehouseId: string;
  capacity: number;
  currentOccupancy: number;
  thresholdPercent: number;
  userUpdaterId: string | null;
  updatedAt: ColumnType<Date, Date | null, Date | null>;
}

export interface UserWarehousesTable {
  id: string;
  userId: string;
  warehouseId: string;
  grantedAt: ColumnType<Date, Date | null, never>;
  grantedBy: string;
  createdAt: ColumnType<Date, Date | null, never>;
}