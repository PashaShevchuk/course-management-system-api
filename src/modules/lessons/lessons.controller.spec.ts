import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../redis/redis.service';
import { AuthService } from '../auth/auth.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

const mockLessonRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const lessonIdMock = 'lesson-id';

describe('LessonsController', () => {
  let lessonsController: LessonsController;
  let lessonsService: LessonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useFactory: mockLessonRepository,
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: RedisService,
          useValue: {},
        },
      ],
    }).compile();

    lessonsService = module.get(LessonsService);
    lessonsController = module.get(LessonsController);
  });

  describe('getAll', () => {
    it('should get all lessons', async () => {
      const result = [new Lesson()];

      jest
        .spyOn(lessonsService, 'getAllLessons')
        .mockImplementation(() => Promise.resolve(result));

      expect(await lessonsController.getAll()).toBe(result);
    });
  });

  describe('getOne', () => {
    it('should get lesson by ID', async () => {
      const result = new Lesson();

      jest
        .spyOn(lessonsService, 'getLessonById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await lessonsController.getOne(lessonIdMock)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create lesson', async () => {
      const result = new Lesson();
      const dto = new CreateLessonDto();

      jest
        .spyOn(lessonsService, 'createLesson')
        .mockImplementation(() => Promise.resolve(result));

      expect(await lessonsController.create(dto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update lesson', async () => {
      const result = new Lesson();
      const dto = new CreateLessonDto();

      jest
        .spyOn(lessonsService, 'updateLesson')
        .mockImplementation(() => Promise.resolve(result));

      expect(await lessonsController.update(lessonIdMock, dto)).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete lesson by ID', async () => {
      jest
        .spyOn(lessonsService, 'deleteLessonById')
        .mockImplementation(() => Promise.resolve());

      await lessonsController.delete(lessonIdMock);

      expect(lessonsService.deleteLessonById).toBeCalledWith(lessonIdMock);
    });
  });
});
