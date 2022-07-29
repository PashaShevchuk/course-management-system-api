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
import { Course } from '../../src/db/entities/course/course.entity';
import { UserRoles } from '../../src/constants';
import { JwtAuthGuard } from '../../src/modules/auth/jwt-auth.guard';

const courseInput = {
  title: 'JavaScript',
  description: 'This course about JavaScript',
};
const verifiedUser = {
  id: 'id',
  email: 'admin@email.com',
  role: UserRoles.ADMIN,
};

describe('CoursesController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Course>;

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
    repository = await app.resolve(getRepositoryToken(Course));
    await repository.query('DELETE FROM public.course;');
  });

  afterAll(async () => {
    await repository.query('DELETE FROM public.course;');
    await app.close();
  });

  describe('Create course', () => {
    it('/create (POST): should create a new course', () => {
      return request(app.getHttpServer())
        .post('/courses/create')
        .send(courseInput)
        .expect(201)
        .then((response) => {
          expect(response.body).toEqual({
            id: expect.any(String),
            title: courseInput.title,
            description: courseInput.description,
            is_published: false,
            created_at: expect.any(String),
            updated_at: expect.any(String),
          });
        });
    });

    it('/create (POST): should return a validation error', () => {
      return request(app.getHttpServer())
        .post('/courses/create')
        .send({ data: 'wrong-data' })
        .expect(400);
    });
  });

  describe('Get courses by status', () => {
    it('/ (POST): should return courses by status', async () => {
      const courses = await request(app.getHttpServer())
        .post('/courses')
        .send({ is_published: false })
        .expect(201);

      expect(courses.body).toEqual(expect.any(Array));
      expect(courses.body.length).toBe(1);
      expect(courses.body[0]).toEqual({
        ...courseInput,
        id: expect.any(String),
        is_published: false,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
  });
});
