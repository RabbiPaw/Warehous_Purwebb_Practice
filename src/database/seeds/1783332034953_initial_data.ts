import { Kysely, sql } from 'kysely';
import { Database } from '../database.interface';
import * as bcrypt from 'bcryptjs';

export async function seed(db: Kysely<Database>): Promise<void> {
  console.log('Inserting seed data...');

  // 1. Roles
  await db.insertInto('roles')
    .values([
      { 
        id: sql`gen_random_uuid()`, 
        name: 'Administrator', 
        description: 'Full access to all system functions',
        sortOrder: 1,
        isActive: true 
      },
      { 
        id: sql`gen_random_uuid()`, 
        name: 'Storekeeper', 
        description: 'Product and movement management',
        sortOrder: 2,
        isActive: true 
      },
      { 
        id: sql`gen_random_uuid()`, 
        name: 'Accountant', 
        description: 'Reports and financial operations',
        sortOrder: 3,
        isActive: true 
      },
      { 
        id: sql`gen_random_uuid()`, 
        name: 'Unknown', 
        description: 'Default role for new users',
        sortOrder: 4,
        isActive: true 
      },
    ])
    .returning('id')
    .execute();
  console.log('Roles inserted');

  // 2. Get role IDs
  const roles = await db
    .selectFrom('roles')
    .select(['id', 'name'])
    .execute();

  const roleMap = Object.fromEntries(
    roles.map(r => [r.name, r.id])
  );

  // 3. Admin user (users, not workers)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminResult = await db.insertInto('users')
    .values({
      id: sql`gen_random_uuid()`,
      email: 'admin@warehouse.com',
      password: hashedPassword,
      name: 'Admin',
      surname: 'System',
      patronymic: null,
      roleId: roleMap['Administrator'],
      isActive: true,
      lastLoginAt: sql`CURRENT_TIMESTAMP`,
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .returning('id')
    .executeTakeFirst();

  if (!adminResult) {
    throw new Error('Failed to create admin user');
  }

  const adminId = adminResult.id;
  console.log(`Admin user created (email: admin@warehouse.com, password: admin123)`);
  console.log(`Admin ID: ${adminId}`);

  // 4. Units (UUID id + code field)
  await db.insertInto('units').values([
    { id: sql`gen_random_uuid()`, code: 'g', name: 'Gram', description: 'Weight unit', sortOrder: 1, isActive: true },
    { id: sql`gen_random_uuid()`, code: 'ml', name: 'Milliliter', description: 'Volume unit', sortOrder: 2, isActive: true },
    { id: sql`gen_random_uuid()`, code: 'p', name: 'Piece', description: 'Quantity unit', sortOrder: 3, isActive: true },
    { id: sql`gen_random_uuid()`, code: 'mm', name: 'Millimeter', description: 'Length unit', sortOrder: 4, isActive: true },
  ]).execute();
  console.log('Units inserted');

  // Get unit IDs by code
  const units = await db
    .selectFrom('units')
    .select(['id', 'code'])
    .execute();

  const unitMap = Object.fromEntries(
    units.map(u => [u.code, u.id])
  );

  // 5. Distribution types
  await db.insertInto('distributionTypes')
    .values([
      { 
        id: sql`gen_random_uuid()`, 
        name: 'Supply', 
        description: 'Goods receipt from supplier', 
        sign: 1, 
        sortOrder: 1,
        isActive: true 
      },
      { 
        id: sql`gen_random_uuid()`, 
        name: 'WriteOff', 
        description: 'Goods write-off from warehouse', 
        sign: -1, 
        sortOrder: 2,
        isActive: true 
      },
      { 
        id: sql`gen_random_uuid()`, 
        name: 'Defect', 
        description: 'Move to defect', 
        sign: -1, 
        sortOrder: 3,
        isActive: true 
      },
      { 
        id: sql`gen_random_uuid()`, 
        name: 'Adjustment', 
        description: 'Quantity adjustment', 
        sign: 0, 
        sortOrder: 4,
        isActive: true 
      },
    ])
    .returning('id')
    .execute();
  console.log('Distribution types inserted');

  // Get distribution type IDs
  const distTypes = await db
    .selectFrom('distributionTypes')
    .select(['id', 'name'])
    .execute();

  const distTypeMap = Object.fromEntries(
    distTypes.map(dt => [dt.name, dt.id])
  );

  // 6. Warehouse
  const warehouseResult = await db.insertInto('warehouses')
    .values({
      id: sql`gen_random_uuid()`,
      name: 'Main Warehouse',
	  isActive: true,
      address: 'Industrial St., 1',
      description: 'Main warehouse for goods storage'
    })
    .returning('id')
    .executeTakeFirst();

  if (!warehouseResult) {
    throw new Error('Failed to create warehouse');
  }

  const warehouseId = warehouseResult.id;
  console.log(`Warehouse created with ID: ${warehouseId}`);

  // 7. User-Warehouse relation (admin has access)
  await db.insertInto('userWarehouses')
    .values({
      id: sql`gen_random_uuid()`,
      userId: adminId,
      warehouseId: warehouseId,
      grantedAt: sql`CURRENT_TIMESTAMP`,
      grantedBy: adminId,
      createdAt: sql`CURRENT_TIMESTAMP`,
    })
    .execute();
  console.log('User-warehouse relation created');

  // 8. Warehouse settings
  await db.insertInto('warehouseSettings').values({
    id: sql`gen_random_uuid()`,
    warehouseId: warehouseId,
    capacity: 1000,
    currentOccupancy: 0,
    thresholdPercent: 10,
    userUpdaterId: adminId,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).execute();
  console.log('Warehouse settings inserted');

  // 9. Products (use unit UUID, not code)
  await db.insertInto('products')
    .values([
      {
        id: sql`gen_random_uuid()`,
        name: 'Dell U2720Q Monitor',
        description: '27-inch 4K monitor',
        unitId: unitMap['p'],
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Lavazza Coffee Beans',
        description: '1 kg, Italian coffee',
        unitId: unitMap['g'],
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Drinking Water 5L',
        description: 'Drinking water in bottles',
        unitId: unitMap['ml'],
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Mechanical Keyboard',
        description: 'Mechanical keyboard with backlight',
        unitId: unitMap['p'],
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Logitech Wireless Mouse',
        description: 'Wireless mouse for office',
        unitId: unitMap['p'],
      },
    ])
    .returning('id')
    .execute();
  console.log('Products inserted');

  // Get product IDs
  const products = await db
    .selectFrom('products')
    .select(['id', 'name'])
    .execute();

  const productMap = Object.fromEntries(
    products.map(p => [p.name, p.id])
  );

  // 10. Suppliers
  await db.insertInto('suppliers')
    .values([
      {
        id: sql`gen_random_uuid()`,
        name: 'TechnoSupply LLC',
        inn: '1234567890',
		isActive: true,
        contact: '+7 (495) 123-45-67, tech@supply.ru',
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'IP Ivanov A.A.',
        inn: '9876543210',
		isActive: true,
        contact: '+7 (916) 123-45-67, ivanov@mail.ru',
      },
    ])
    .returning('id')
    .execute();
  console.log('Suppliers inserted');

  // Get supplier IDs
  const suppliers = await db
    .selectFrom('suppliers')
    .select(['id', 'name'])
    .execute();

  const supplierMap = Object.fromEntries(
    suppliers.map(s => [s.name, s.id])
  );

  // 11. Distributions
  const now = new Date();
  
  await db.insertInto('distributions').values([
    {
      id: sql`gen_random_uuid()`,
      userId: adminId,
      distributionTypeId: distTypeMap['Supply'],
      productId: productMap['Dell U2720Q Monitor'],
      supplierId: supplierMap['TechnoSupply LLC'],
      warehouseId: warehouseId,
      distributionDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      quantity: 10,
      unitId: unitMap['p'],
      description: 'Monitor delivery for development department',
    },
    {
      id: sql`gen_random_uuid()`,
      userId: adminId,
      distributionTypeId: distTypeMap['Supply'],
      productId: productMap['Lavazza Coffee Beans'],
      supplierId: supplierMap['IP Ivanov A.A.'],
      warehouseId: warehouseId,
      distributionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      quantity: 5000,
      unitId: unitMap['g'],
      description: 'Coffee delivery for office',
    },
    {
      id: sql`gen_random_uuid()`,
      userId: adminId,
      distributionTypeId: distTypeMap['WriteOff'],
      productId: productMap['Dell U2720Q Monitor'],
      supplierId: supplierMap['TechnoSupply LLC'],
      warehouseId: warehouseId,
      distributionDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      quantity: 2,
      unitId: unitMap['p'],
      description: 'Monitor issuance to employees',
    },
    {
      id: sql`gen_random_uuid()`,
      userId: adminId,
      distributionTypeId: distTypeMap['Supply'],
      productId: productMap['Drinking Water 5L'],
      supplierId: supplierMap['TechnoSupply LLC'],
      warehouseId: warehouseId,
      distributionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      quantity: 100000,
      unitId: unitMap['ml'],
      description: 'Water delivery for office',
    },
  ]).execute();
  console.log('Distributions inserted');

  console.log('Seed data inserted successfully');
}