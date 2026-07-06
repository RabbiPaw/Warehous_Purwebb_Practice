import { Module, Global, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './database.interface';

@Global()
@Module({
  providers: [
    {
      provide: 'DB_CONNECTION',
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          host: configService.get<string>('POSTGRES_HOST'),
          port: configService.get<number>('POSTGRES_PORT'),
          user: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });

        return new Kysely<Database>({
          dialect: new PostgresDialect({ pool }),
          plugins: [new CamelCasePlugin()],
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DB_CONNECTION'],
})
export class DatabaseModule implements OnModuleInit {
  constructor(@Inject('DB_CONNECTION') private db: Kysely<Database>) {}

  async onModuleInit() {
    let retries = 10;
    while (retries > 0) {
      try {
        await this.db.selectFrom('users').select('id').limit(1).execute();
        console.log('Database connected successfully');
        return;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('Database connection failed:', error);
          process.exit(1);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}