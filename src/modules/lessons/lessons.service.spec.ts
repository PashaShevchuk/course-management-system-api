import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockLessonRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const lessonIdMock = 'lesson-id';
const courseIdMock = 'course-id';
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

describe('LessonsService', () => {
  let lessonsService: LessonsService;
  let lessonRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useFactory: mockLessonRepository,
        },
      ],
    }).compile();

    lessonsService = module.get(LessonsService);
    lessonRepository = module.get(getRepositoryToken(Lesson));
  });

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
});
