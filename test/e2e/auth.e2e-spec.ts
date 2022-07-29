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
import { UserRoles } from '../../src/constants';
import { JwtAuthGuard } from '../../src/modules/auth/jwt-auth.guard';

const dataToCreateAdmin = {
  first_name: 'Bob',
  last_name: 'Doe',
  email: 'bob@email.com',
  password: '123456789',
  is_active: true,
};
const userLoginData = {
  email: dataToCreateAdmin.email,
  password: dataToCreateAdmin.password,
};
const verifiedUser = {
  id: 'id',
  email: 'admin@email.com',
  role: UserRoles.ADMIN,
};

describe('AuthController (e2e)', () => {
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

  describe('Log in user', () => {
    it('/login (POST): should log in user', async () => {
      // Pre-populate the DB with a user
      await request(app.getHttpServer())
        .post('/admins/create')
        .send(dataToCreateAdmin)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLoginData)
        .expect(201);

      expect(response.body.token).toBeDefined();
    });

    it('/login (POST): fails to authenticate user with wrong credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong-email',
          password: 'wrong-password',
        })
        .expect(400);

      expect(response.body.token).not.toBeDefined();
    });
  });
});
