import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Instructor } from '../../src/db/entities/instructor/instructor.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../../src/config/config.service';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';

const instructorInput = {
  first_name: 'Mary',
  last_name: 'Miles',
  email: 'mary@email.com',
  password: 'SomePassword1',
  position: 'Senior instructor',
};

describe('InstructorsController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Instructor>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(configService.getE2ETypeOrmConfig()),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    repository = await app.resolve(getRepositoryToken(Instructor));
    await repository.query('DELETE FROM public.instructor;');
  });

  afterAll(async () => {
    await repository.query('DELETE FROM public.instructor;');
    await app.close();
  });

  describe('Instructor registration', () => {
    it('/registration (POST): should register an instructor', () => {
      return request(app.getHttpServer())
        .post('/instructors/registration')
        .send(instructorInput)
        .expect(201)
        .then((response) => {
          expect(response.text).toEqual(
            'The account data have been sent to the administrator for verification. After verification, you will receive an email.',
          );
        });
    });

    it('/registration (POST): should return a validation error', () => {
      return request(app.getHttpServer())
        .post('/instructors/registration')
        .send({ data: 'wrong-data' })
        .expect(400);
    });

    it('/registration (POST): should return an error when a user already exists', () => {
      return request(app.getHttpServer())
        .post('/instructors/registration')
        .send(instructorInput)
        .expect(400, {
          statusCode: 400,
          message: 'A user with this email already exists',
        });
    });
  });
});
