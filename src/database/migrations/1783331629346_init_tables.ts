import { Kysely, sql } from 'kysely';
import { Database } from '../database.interface';

export async function up(db: Kysely<Database>): Promise<void> {
  console.log('Creating tables...');

  // ============================================
  // 1. roles
  // ============================================
  await db.schema
    .createTable('roles')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(50)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('sort_order', 'smallint', (col) => col.defaultTo(0))
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // ============================================
  // 2. users
  // ============================================
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('password', 'varchar(100)', (col) => col.notNull())
    .addColumn('name', 'varchar(50)', (col) => col.notNull())
    .addColumn('surname', 'varchar(50)', (col) => col.notNull())
    .addColumn('patronymic', 'varchar(50)')
    .addColumn('role_id', 'varchar(36)', (col) =>
      col.references('roles.id').onDelete('set null')
    )
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('last_login_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // ============================================
  // 3. warehouses
  // ============================================
  await db.schema
    .createTable('warehouses')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('address', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // ============================================
  // 4. user_warehouses
  // ============================================
  await db.schema
    .createTable('user_warehouses')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('user_id', 'varchar(36)', (col) =>
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('warehouse_id', 'varchar(36)', (col) =>
      col.references('warehouses.id').onDelete('cascade').notNull()
    )
    .addColumn('granted_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('granted_by', 'varchar(36)', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addUniqueConstraint('user_warehouses_unique', ['user_id', 'warehouse_id'])
    .execute();

  // ============================================
  // 5. units
  // ============================================
  await db.schema
    .createTable('units')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('code', 'varchar(10)', (col) => col.notNull().unique())
    .addColumn('name', 'varchar(30)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('sort_order', 'smallint', (col) => col.defaultTo(0))
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // ============================================
  // 6. products
  // ============================================
  await db.schema
    .createTable('products')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('unit_id', 'varchar(36)', (col) =>
      col.references('units.id').onDelete('restrict').notNull()
    )
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // ============================================
  // 7. suppliers
  // ============================================
  await db.schema
    .createTable('suppliers')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('inn', 'varchar(12)', (col) => col.notNull().unique())
    .addColumn('contact', 'text')
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // ============================================
  // 8. distribution_types
  // ============================================
  await db.schema
    .createTable('distribution_types')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(50)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('sign', 'integer', (col) => col.defaultTo(1))
    .addColumn('sort_order', 'smallint', (col) => col.defaultTo(0))
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // ============================================
  // 9. distributions (исправлено: добавлены DEFAULT)
  // ============================================
  await db.schema
    .createTable('distributions')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('user_id', 'varchar(36)', (col) =>
      col.references('users.id').onDelete('restrict').notNull()
    )
    .addColumn('distribution_type_id', 'varchar(36)', (col) =>
      col.references('distribution_types.id').onDelete('restrict').notNull()
    )
    .addColumn('product_id', 'varchar(36)', (col) =>
      col.references('products.id').onDelete('restrict').notNull()
    )
    .addColumn('supplier_id', 'varchar(36)', (col) =>
      col.references('suppliers.id').onDelete('restrict').notNull()
    )
    .addColumn('warehouse_id', 'varchar(36)', (col) =>
      col.references('warehouses.id').onDelete('restrict').notNull()
    )
    .addColumn('distribution_date', 'timestamptz', (col) => col.notNull())
    .addColumn('quantity', 'integer', (col) => col.notNull())
    .addColumn('unit_id', 'varchar(36)', (col) =>
      col.references('units.id').onDelete('restrict').notNull()
    )
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // ============================================
  // 10. warehouse_settings
  // ============================================
  await db.schema
    .createTable('warehouse_settings')
    .ifNotExists()
    .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
    .addColumn('warehouse_id', 'varchar(36)', (col) =>
      col.references('warehouses.id').onDelete('cascade').notNull()
    )
    .addColumn('capacity', 'integer', (col) => col.notNull())
    .addColumn('current_occupancy', 'integer', (col) => col.defaultTo(0))
    .addColumn('threshold_percent', 'integer', (col) => col.defaultTo(10))
    .addColumn('user_updater_id', 'varchar(36)', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();

  console.log('All tables created successfully');
}

export async function down(db: Kysely<Database>): Promise<void> {
  console.log('Rolling back migrations...');

  await db.schema.dropTable('warehouse_settings').ifExists().cascade().execute();
  await db.schema.dropTable('distributions').ifExists().cascade().execute();
  await db.schema.dropTable('distribution_types').ifExists().cascade().execute();
  await db.schema.dropTable('products').ifExists().cascade().execute();
  await db.schema.dropTable('suppliers').ifExists().cascade().execute();
  await db.schema.dropTable('units').ifExists().cascade().execute();
  await db.schema.dropTable('user_warehouses').ifExists().cascade().execute();
  await db.schema.dropTable('warehouses').ifExists().cascade().execute();
  await db.schema.dropTable('users').ifExists().cascade().execute();
  await db.schema.dropTable('roles').ifExists().cascade().execute();

  console.log('Rollback completed');
}