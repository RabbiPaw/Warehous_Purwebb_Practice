import { defineConfig } from 'kysely-ctl';
import { CamelCasePlugin, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

export default defineConfig({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'warehouse_db',
      max: 20,
      idleTimeoutMillis: 30000,
    }),
  }),
  // Включаем CamelCasePlugin для автоматического преобразования
  plugins: [new CamelCasePlugin()],
  migrations: {
    // Папка с миграциями
    migrationFolder: '../src/database/migrations',
    // Имя таблицы для отслеживания миграций
    migrationTableName: 'migrations',
    // Схема для таблицы миграций
    migrationTableSchema: 'public',
  },
  seeds: {
    // Папка с сидами
    seedFolder: '../src/database/seeds',
  },
});