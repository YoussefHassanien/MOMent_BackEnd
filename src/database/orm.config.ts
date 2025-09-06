import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

export const dataSourceAsyncOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    return {
      type: 'postgres',
      url: configService.getOrThrow<string>('databaseUrl'),
      ssl: {
        rejectUnauthorized: false,
      },
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
      synchronize: false,
      logging: configService.getOrThrow<string>('environment') === 'dev',
    };
  },
};

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: process.env.ENVIRONMENT === 'dev',
};
export const dataSource = new DataSource(dataSourceOptions);
