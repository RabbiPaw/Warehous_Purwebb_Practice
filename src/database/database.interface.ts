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

// ============================================
// Users
// ============================================
export interface UsersTable {
  id: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  patronymic: string | null;
  roleId: string;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// Roles (createdAt, updatedAt - DEFAULT в БД)
// ============================================
export interface RolesTable {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// Products (createdAt, updatedAt - DEFAULT в БД)
// ============================================
export interface ProductsTable {
  id: string;
  name: string;
  description: string | null;
  unitId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// Suppliers (createdAt, updatedAt - DEFAULT в БД)
// ============================================
export interface SuppliersTable {
  id: string;
  name: string;
  inn: string;
  contact: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// Distributions (createdAt, updatedAt - DEFAULT в БД)
// ============================================
export interface DistributionsTable {
  id: string;
  userId: string;
  distributionTypeId: string;
  productId: string;
  supplierId: string;
  warehouseId: string;
  distributionDate: Date;
  quantity: number;
  unitId: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// Distribution Types (createdAt, updatedAt - DEFAULT в БД)
// ============================================
export interface DistributionTypesTable {
  id: string;
  name: string;
  description: string | null;
  sign: number;
  sortOrder: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// Units (createdAt, updatedAt - DEFAULT в БД)
// ============================================
export interface UnitsTable {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// Warehouses (createdAt, updatedAt - DEFAULT в БД)
// ============================================
export interface WarehousesTable {
  id: string;
  name: string;
  address: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// Warehouse Settings History
// ============================================
export interface WarehouseSettingsHistoryTable {
  id: string;
  warehouseId: string;
  capacity: number;
  currentOccupancy: number;
  thresholdPercent: number;
  userUpdaterId: string | null;
  updatedAt?: Date;
}

// ============================================
// User Warehouses
// ============================================
export interface UserWarehousesTable {
  id: string;
  userId: string;
  warehouseId: string;
  grantedAt: Date;
  grantedBy: string;
  createdAt?: Date;
}