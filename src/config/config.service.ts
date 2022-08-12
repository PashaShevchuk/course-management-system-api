import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { DataSourceOptions } from 'typeorm';
import * as nodemailerMailgunTransport from 'nodemailer-mailgun-transport';

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

  public getTypeOrmConfig(): DataSourceOptions {
    this.ensureValues(REQUIRED_VARS);

    return {
      ...this.getBaseTypeOrmConfig(),
      entities: ['dist/db/entities/**/*.entity.js'],
    };
  }

  public getE2ETypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT_E2E'), 10),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE_E2E'),
      migrationsTableName: 'migration',
      migrations: ['dist/db/migration/*.js'],
      logging: this.isProduction() ? ['error'] : ['query', 'error'],
      synchronize: true,
      entities: ['**/*.entity{.ts,.js}'],
    };
  }

  public async getMailConfig() {
    return {
      transport: nodemailerMailgunTransport({
        auth: {
          api_key: this.getValue('MAILGUN_API_KEY'),
          domain: this.getValue('MAILGUN_API_DOMAIN'),
        },
      }),
      template: {
        dir: join(process.cwd(), 'dist', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }

  private getBaseTypeOrmConfig(): DataSourceOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT'), 10),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      migrationsTableName: 'migration',
      migrations: ['dist/db/migration/*.js'],
      logging: this.isProduction() ? ['error'] : ['query', 'error'],
      synchronize: this.getValue('SYNCHRONIZE') === 'true',
    };
  }

  public getTokenPrivateKey(): string {
    return this.getValue('PRIVATE_KEY');
  }

  public isEmailEnable(): boolean {
    return this.getValue('IS_EMAIL_ENABLED') === 'true';
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

  public getStorageConfig(): { [key: string]: string } {
    return {
      projectId: this.getValue('PROJECT_ID'),
      private_key: this.getValue('GCP_PRIVATE_KEY'),
      client_email: this.getValue('CLIENT_EMAIL'),
      bucket: this.getValue('HW_BUCKET'),
    };
  }
}

const configService = new ConfigService(process.env);

export { configService };
