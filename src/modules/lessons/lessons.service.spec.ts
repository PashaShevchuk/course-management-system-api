import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';
import { UserRoles } from '../../constants';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const lessonIdMock = 'lesson-id';
const courseIdMock = 'course-id';
const studentIdMock = 'student-id';
const markIdMock = 'mark-id';
const lessonMockData = {
  id: lessonIdMock,
  title: 'Literature',
  description: 'Some text ',
  highest_mark: 100,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};
const createLessonDataMock = {
  title: lessonMockData.title,
  description: lessonMockData.description,
  highest_mark: lessonMockData.highest_mark,
  course_id: courseIdMock,
};
const notFoundError = new HttpException('Data not found', HttpStatus.NOT_FOUND);
const courseNotFoundErr = new HttpException(
  'Course not found',
  HttpStatus.BAD_REQUEST,
);
const lessonMarksDataMock = {
  id: markIdMock,
  mark: 10,
  created_at: '2022-07-10T09:34:44.807Z',
  updated_at: '2022-07-10T09:34:44.807Z',
  lesson: {
    id: lessonIdMock,
    title: 'C#',
    description: 'Some text',
    highest_mark: 10,
    created_at: '2022-06-26T08:57:34.146Z',
    updated_at: '2022-06-26T08:57:34.146Z',
  },
  student: {
    id: studentIdMock,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@email.com',
    birth_date: '1995-01-01',
    is_active: true,
    role: UserRoles.STUDENT,
    created_at: '2022-06-17T12:21:28.478Z',
    updated_at: '2022-06-17T12:21:28.478Z',
  },
};

describe('LessonsService', () => {
  let lessonsService: LessonsService;
  let lessonRepository;
  let studentMarkRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    lessonsService = module.get(LessonsService);
    lessonRepository = module.get(getRepositoryToken(Lesson));
    studentMarkRepository = module.get(getRepositoryToken(StudentMark));
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllLessons', () => {
    it('should get all lessons', async () => {
      lessonRepository.find.mockResolvedValue([lessonMockData]);

      const result = await lessonsService.getAllLessons();

      expect(lessonRepository.find).toHaveBeenCalled();
      expect(result).toEqual([lessonMockData]);
    });
  });

  describe('getLessonById', () => {
    it('should get lesson by ID', async () => {
      lessonRepository.findOne.mockResolvedValue(lessonMockData);

      const result = await lessonsService.getLessonById(lessonIdMock);

      expect(lessonRepository.findOne).toHaveBeenCalledWith({
        where: { id: lessonIdMock },
      });
      expect(result).toEqual(lessonMockData);
    });

    it('should throw an error if lesson is not found', async () => {
      lessonRepository.findOne.mockResolvedValue(null);

      await expect(lessonsService.getLessonById(lessonIdMock)).rejects.toThrow(
        notFoundError,
      );
    });
  });

  describe('createLesson', () => {
    it('should create lesson', async () => {
      lessonRepository.save.mockResolvedValue(lessonMockData);

      const result = await lessonsService.createLesson(createLessonDataMock);

      expect(lessonRepository.save).toHaveBeenCalled();
      expect(result).toEqual(lessonMockData);
    });

    it('should throw an error', async () => {
      const errorMock = new HttpException(
        'Course not found',
        HttpStatus.BAD_REQUEST,
      );

      lessonRepository.save.mockRejectedValue(errorMock);

      await expect(
        lessonsService.createLesson(createLessonDataMock),
      ).rejects.toThrow(errorMock);
    });

    it('should throw an error if lesson course is not found', async () => {
      lessonRepository.save.mockRejectedValue({ code: '23503' });

      try {
        await lessonsService.createLesson(createLessonDataMock);
      } catch (err) {
        expect(lessonRepository.save).toHaveBeenCalled();
        expect(err).toEqual(courseNotFoundErr);
      }
    });
  });

  describe('updateLesson', () => {
    it('should update lesson', async () => {
      lessonRepository.findOne.mockResolvedValue(lessonMockData);
      lessonRepository.save.mockResolvedValue(lessonMockData);

      const result = await lessonsService.updateLesson(
        lessonIdMock,
        createLessonDataMock,
      );

      expect(lessonRepository.findOne).toHaveBeenCalledWith({
        where: { id: lessonIdMock },
      });
      expect(lessonRepository.save).toHaveBeenCalled();
      expect(result).toEqual(lessonMockData);
    });

    it('should throw an error', async () => {
      const errorMock = new HttpException(
        'Course not found',
        HttpStatus.BAD_REQUEST,
      );

      lessonRepository.findOne.mockResolvedValue(lessonMockData);
      lessonRepository.save.mockRejectedValue(errorMock);

      await expect(
        lessonsService.updateLesson(lessonIdMock, createLessonDataMock),
      ).rejects.toThrow(errorMock);
      expect(lessonRepository.findOne).toHaveBeenCalledWith({
        where: { id: lessonIdMock },
      });
    });

    it('should throw an error if lesson course is not found', async () => {
      lessonRepository.findOne.mockResolvedValue(lessonMockData);
      lessonRepository.save.mockRejectedValue({ code: '23503' });

      try {
        await lessonsService.updateLesson(lessonIdMock, createLessonDataMock);
      } catch (err) {
        expect(lessonRepository.save).toHaveBeenCalled();
        expect(err).toEqual(courseNotFoundErr);
      }
    });
  });

  describe('deleteLessonById', () => {
    it('should delete lesson by ID', async () => {
      lessonRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

      await lessonsService.deleteLessonById(lessonIdMock);

      expect(lessonRepository.delete).toHaveBeenCalledWith(lessonIdMock);
    });

    it('should throw an error', async () => {
      lessonRepository.delete.mockResolvedValue({ raw: [], affected: 0 });

      await expect(
        lessonsService.deleteLessonById(lessonIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('getLessonMarks', () => {
    it('should get lesson marks', async () => {
      studentMarkRepository.find.mockResolvedValue([lessonMarksDataMock]);

      const result = await lessonsService.getLessonMarks(lessonIdMock);

      expect(studentMarkRepository.find).toHaveBeenCalledWith({
        where: { lesson: { id: lessonIdMock } },
        relations: {
          lesson: true,
          student: true,
        },
      });
      expect(result).toEqual([
        {
          id: lessonMarksDataMock.id,
          mark: lessonMarksDataMock.mark,
          created_at: lessonMarksDataMock.created_at,
          updated_at: lessonMarksDataMock.updated_at,
          lesson: {
            id: lessonMarksDataMock.lesson.id,
            title: lessonMarksDataMock.lesson.title,
            highest_mark: lessonMarksDataMock.lesson.highest_mark,
          },
          student: {
            id: lessonMarksDataMock.student.id,
            first_name: lessonMarksDataMock.student.first_name,
            last_name: lessonMarksDataMock.student.last_name,
          },
        },
      ]);
    });

    it('should return an empty array', async () => {
      studentMarkRepository.find.mockResolvedValue([]);

      const result = await lessonsService.getLessonMarks(lessonIdMock);

      expect(studentMarkRepository.find).toHaveBeenCalledWith({
        where: { lesson: { id: lessonIdMock } },
        relations: {
          lesson: true,
          student: true,
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('deleteMark', () => {
    it('should delete mark by ID', async () => {
      studentMarkRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

      await lessonsService.deleteMark(lessonIdMock, markIdMock);

      expect(studentMarkRepository.delete).toHaveBeenCalledWith({
        id: markIdMock,
        lesson: { id: lessonIdMock },
      });
    });

    it('should throw an error', async () => {
      studentMarkRepository.delete.mockResolvedValue({ raw: [], affected: 0 });

      await expect(
        lessonsService.deleteMark(lessonIdMock, markIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });
});
