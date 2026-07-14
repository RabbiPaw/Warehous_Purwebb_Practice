import { Kysely } from 'kysely';
import { Database } from '../database.interface';

export async function up(db: Kysely<Database>): Promise<void> {
  console.log('Creating indexes...');

  // distributions
  await db.schema
    .createIndex('idx_distributions_user_id')
    .on('distributions')
    .column('user_id')
    .ifNotExists()
    .execute();

  await db.schema
    .createIndex('idx_distributions_product_id')
    .on('distributions')
    .column('product_id')
    .ifNotExists()
    .execute();

  await db.schema
    .createIndex('idx_distributions_distribution_date')
    .on('distributions')
    .column('distribution_date')
    .ifNotExists()
    .execute();

  await db.schema
    .createIndex('idx_distributions_warehouse_id')
    .on('distributions')
    .column('warehouse_id')
    .ifNotExists()
    .execute();

  // user_warehouses
  await db.schema
    .createIndex('idx_user_warehouses_user_id')
    .on('user_warehouses')
    .column('user_id')
    .ifNotExists()
    .execute();

  await db.schema
    .createIndex('idx_user_warehouses_warehouse_id')
    .on('user_warehouses')
    .column('warehouse_id')
    .ifNotExists()
    .execute();

  // warehouse_settings
  await db.schema
    .createIndex('idx_warehouse_settings_warehouse_id')
    .on('warehouse_settings')
    .column('warehouse_id')
    .ifNotExists()
    .execute();

  await db.schema
    .createIndex('idx_warehouse_settings_user_updater_id')
    .on('warehouse_settings')
    .column('user_updater_id')
    .ifNotExists()
    .execute();

  // users
  await db.schema
    .createIndex('idx_users_email')
    .on('users')
    .column('email')
    .ifNotExists()
    .execute();

  await db.schema
    .createIndex('idx_users_role_id')
    .on('users')
    .column('role_id')
    .ifNotExists()
    .execute();

  // suppliers
  await db.schema
    .createIndex('idx_suppliers_inn')
    .on('suppliers')
    .column('inn')
    .ifNotExists()
    .execute();

  // products
  await db.schema
    .createIndex('idx_products_unit_id')
    .on('products')
    .column('unit_id')
    .ifNotExists()
    .execute();

  console.log('All indexes created successfully');
}

export async function down(db: Kysely<Database>): Promise<void> {
  console.log('Dropping indexes...');

  await db.schema.dropIndex('idx_products_unit_id').ifExists().execute();
  await db.schema.dropIndex('idx_suppliers_inn').ifExists().execute();
  await db.schema.dropIndex('idx_users_role_id').ifExists().execute();
  await db.schema.dropIndex('idx_users_email').ifExists().execute();
  await db.schema.dropIndex('idx_warehouse_settings_user_updater_id').ifExists().execute();
  await db.schema.dropIndex('idx_warehouse_settings_warehouse_id').ifExists().execute();
  await db.schema.dropIndex('idx_user_warehouses_warehouse_id').ifExists().execute();
  await db.schema.dropIndex('idx_user_warehouses_user_id').ifExists().execute();
  await db.schema.dropIndex('idx_distributions_warehouse_id').ifExists().execute();
  await db.schema.dropIndex('idx_distributions_distribution_date').ifExists().execute();
  await db.schema.dropIndex('idx_distributions_product_id').ifExists().execute();
  await db.schema.dropIndex('idx_distributions_user_id').ifExists().execute();

  console.log('All indexes dropped successfully');
}