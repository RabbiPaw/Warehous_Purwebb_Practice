import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config.validation';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],         
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: true,             
      },
    }),
  ],
  exports: [NestConfigModule]
})
export class ConfigModule {}