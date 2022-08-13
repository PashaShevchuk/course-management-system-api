import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../../src/config/config.service';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';
import { Student } from '../../src/db/entities/student/student.entity';
import { JwtAuthGuard } from '../../src/modules/auth/jwt-auth.guard';
import { UserRoles } from '../../src/constants';

const studentInput = {
  first_name: 'Mary',
  last_name: 'Miles',
  email: 'marymm@email.com',
  password: 'SomePassword1',
  birth_date: '01.01.1990',
  is_active: true,
};
const verifiedUser = {
  id: 'id',
  email: 'email@email.com',
  role: UserRoles.ADMIN,
};

describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Student>;

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
    repository = await app.resolve(getRepositoryToken(Student));
    await repository.query('DELETE FROM public.student;');
  });

  afterAll(async () => {
    await repository.query('DELETE FROM public.student;');
    await app.close();
  });

  describe('Create a student', () => {
    it('/create (POST): create a new student by admin', () => {
      return request(app.getHttpServer())
        .post('/students/create')
        .send(studentInput)
        .expect(201)
        .then((response) => {
          expect(response.body).toEqual({
            id: expect.any(String),
            first_name: studentInput.first_name,
            last_name: studentInput.last_name,
            email: studentInput.email,
            birth_date: studentInput.birth_date,
            is_active: studentInput.is_active,
            role: UserRoles.STUDENT,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          });
        });
    });

    it('/create (POST): should return a validation error', () => {
      return request(app.getHttpServer())
        .post('/students/create')
        .send({ data: 'wrong-data' })
        .expect(400);
    });

    it('/create (POST): should return an error when a user already exists', () => {
      return request(app.getHttpServer())
        .post('/students/create')
        .send(studentInput)
        .expect(400, {
          statusCode: 400,
          message: 'A user with this email already exists',
        });
    });
  });
});
