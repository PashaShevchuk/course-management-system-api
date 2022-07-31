import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../redis/redis.service';
import { AuthService } from '../auth/auth.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const lessonIdMock = 'lesson-id';
const markIdMock = 'mark-id';

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
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(StudentMark),
          useFactory: mockRepository,
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

  afterEach(() => jest.clearAllMocks());

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

  describe('getLessonMarks', () => {
    it('should get lesson marks', async () => {
      const result = {
        id: 'd5eebb06-0d8c-4857-8625-d4a9921dc91c',
        mark: 9,
        created_at: '2022-07-10T09:34:44.807Z',
        updated_at: '2022-07-10T09:34:44.807Z',
        student: {
          id: 'a1e8a51f-55fb-41a0-9106-6eed481c47db',
          first_name: 'John',
          last_name: 'Doe',
        },
      };

      jest
        .spyOn(lessonsService, 'getLessonMarks')
        .mockImplementation(() => Promise.resolve([result]));

      expect(await lessonsController.getLessonMarks(lessonIdMock)).toEqual([
        result,
      ]);
    });
  });

  describe('deleteMark', () => {
    it('should delete mark by ID', async () => {
      jest
        .spyOn(lessonsService, 'deleteMark')
        .mockImplementation(() => Promise.resolve());

      await lessonsController.deleteMark(lessonIdMock, markIdMock);

      expect(lessonsService.deleteMark).toBeCalledWith(
        lessonIdMock,
        markIdMock,
      );
    });
  });
});
