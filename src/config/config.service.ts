import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

const REQUIRED_VARS = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
];

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Injectable()
export class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));

    return this;
  }

  public isProduction(): boolean {
    const mode = this.getValue('NODE_ENV', false);

    return mode === 'production';
  }

  public async getTypeOrmConfig(): Promise<TypeOrmModuleOptions> {
    this.ensureValues(REQUIRED_VARS);

    return {
      ...this.getBaseTypeOrmConfig(),
      entities: ['dist/db/entities/**/*.entity.js'],
    };
  }

  public getE2ETypeOrmConfig(): TypeOrmModuleOptions {
    return {
      ...this.getBaseTypeOrmConfig(),
      entities: ['**/*.entity{.ts,.js}'],
    };
  }

  private getBaseTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT'), 10),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      migrationsTableName: 'migration',
      migrations: ['dist/db/migration/*.js'],
      cli: {
        migrationsDir: 'src/db/migration',
      },
      logging: this.isProduction() ? ['error'] : ['query', 'error'],
      synchronize: this.getValue('SYNCHRONIZE') === 'true',
    };
  }

  public getTokenPrivateKey(): string {
    return this.getValue('PRIVATE_KEY');
  }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];

    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public async getRedisConfig(): Promise<{ [key: string]: any }> {
    return {
      store: redisStore,
      host: this.getValue('REDIS_HOST'),
      port: parseInt(this.getValue('REDIS_PORT'), 10),
      prefix: this.getValue('REDIS_PREFIX'),
      ttl: parseInt(this.getValue('CACHE_TTL'), 10),
    };
  }
}

const configService = new ConfigService(process.env);

export { configService };
