import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../../src/config/config.service';
import { Admin } from '../../src/db/entities/admin/admin.entity';
import { JwtAuthGuard } from '../../src/modules/auth/jwt-auth.guard';
import { UserRoles } from '../../src/constants';

const adminInput = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@email.com',
  password: 'SomePassword1',
  is_active: true,
};
const verifiedUser = {
  id: 'id',
  email: 'admin@email.com',
  role: UserRoles.ADMIN,
};

describe('AdminsController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Admin>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(configService.getE2ETypeOrmConfig()),
        AppModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = verifiedUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    repository = await app.resolve(getRepositoryToken(Admin));
    await repository.query('DELETE FROM public.admin;');
  });

  afterAll(async () => {
    await repository.query('DELETE FROM public.admin;');
    await app.close();
  });

  describe('Create a user', () => {
    it('/create (POST): should create a new admin by admin', () => {
      return request(app.getHttpServer())
        .post('/admins/create')
        .send(adminInput)
        .expect(201)
        .then((response) => {
          expect(response.body).toEqual({
            id: expect.any(String),
            first_name: adminInput.first_name,
            last_name: adminInput.last_name,
            email: adminInput.email,
            is_active: adminInput.is_active,
            role: UserRoles.ADMIN,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          });
        });
    });

    it('/create (POST): should return a validation error', () => {
      return request(app.getHttpServer())
        .post('/admins/create')
        .send({ data: 'wrong-data' })
        .expect(400);
    });

    it('/create (POST): should return an error when a user already exists', () => {
      return request(app.getHttpServer())
        .post('/admins/create')
        .send(adminInput)
        .expect(400, {
          statusCode: 400,
          message: 'A user with this email already exists',
        });
    });
  });
});
