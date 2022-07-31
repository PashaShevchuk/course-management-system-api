import { CoursesService } from './courses.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '../../db/entities/course/course.entity';
import { InstructorCourse } from '../../db/entities/instructor-course/instructor-course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { InstructorsService } from '../instructors/instructors.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRoles } from '../../constants';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const idMock = 'id';
const courseIdMock = 'course-id';
const instructorIdMock = 'instructor-id';
const lessonIdMock = 'lesson-id';
const courseDataMock = {
  id: courseIdMock,
  title: 'string',
  description: 'string',
  is_published: true,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};
const notFoundError = new HttpException('Data not found', HttpStatus.NOT_FOUND);
const instructorCourseDataMock = {
  id: idMock,
  courseId: courseIdMock,
  instructorId: instructorIdMock,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};
const lessonMockData = {
  id: lessonIdMock,
  title: 'Literature',
  description: 'Some text ',
  highest_mark: 100,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};
const createCourseDataMock = {
  title: courseDataMock.title,
  description: courseDataMock.description,
};
const instructorDataMock = {
  id: instructorIdMock,
  first_name: 'first_name',
  last_name: 'last_name',
  email: 'email',
  hash_password: 'hash',
  position: 'Senior instructor',
  is_active: true,
  role: UserRoles.INSTRUCTOR,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};

const mockedInstructorsService = {
  getInstructorById: jest.fn(() => Promise.resolve(instructorDataMock)),
};

describe('CoursesService', () => {
  let coursesService: CoursesService;
  let courseRepository;
  let instructorCourseRepository;
  let lessonRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(InstructorCourse),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Lesson),
          useFactory: mockRepository,
        },
        {
          provide: InstructorsService,
          useValue: mockedInstructorsService,
        },
      ],
    }).compile();

    coursesService = module.get(CoursesService);
    courseRepository = module.get(getRepositoryToken(Course));
    instructorCourseRepository = module.get(
      getRepositoryToken(InstructorCourse),
    );
    lessonRepository = module.get(getRepositoryToken(Lesson));
  });

  afterEach(() => jest.clearAllMocks());

  describe('getCourseById', () => {
    it('should get a course by ID', async () => {
      courseRepository.findOne.mockResolvedValue(courseDataMock);

      const result = await coursesService.getCourseById(courseIdMock);

      expect(courseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseIdMock },
      });
      expect(result).toEqual(courseDataMock);
    });

    it('should throw an error if a course is not found', async () => {
      courseRepository.findOne.mockResolvedValue(null);

      await expect(coursesService.getCourseById(courseIdMock)).rejects.toThrow(
        notFoundError,
      );
    });
  });

  describe('getAllCourses', () => {
    it('should get all published courses', async () => {
      courseRepository.find.mockResolvedValue([courseDataMock]);

      const result = await coursesService.getAllCourses();

      expect(courseRepository.find).toHaveBeenCalledWith({
        where: { is_published: true },
      });
      expect(result).toEqual([courseDataMock]);
    });
  });

  describe('publishCourse', () => {
    it('should publish a course', async () => {
      const notPublishedCourseDataMock = {
        ...courseDataMock,
        is_published: false,
      };
      const lessonsWithCountDataMock = [[lessonMockData], 5];

      courseRepository.findOne.mockResolvedValue(notPublishedCourseDataMock);
      instructorCourseRepository.findOne.mockResolvedValue(
        instructorCourseDataMock,
      );
      lessonRepository.findAndCount.mockResolvedValue(lessonsWithCountDataMock);
      courseRepository.save.mockResolvedValue(courseDataMock);

      const result = await coursesService.publishCourse(courseIdMock);

      expect(courseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseIdMock },
      });
      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: { course: { id: courseIdMock } },
      });
      expect(lessonRepository.findAndCount).toHaveBeenCalledWith({
        where: { course: { id: courseIdMock } },
      });
      expect(courseRepository.save).toHaveBeenCalled();
      expect(result).toEqual(courseDataMock);
    });

    it('should throw an error if a course has already been published', async () => {
      const errorMock = new HttpException(
        'The course has already been published',
        HttpStatus.BAD_REQUEST,
      );

      courseRepository.findOne.mockResolvedValue(courseDataMock);

      await expect(coursesService.publishCourse(courseIdMock)).rejects.toThrow(
        errorMock,
      );
      expect(courseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseIdMock },
      });
      expect(instructorCourseRepository.findOne).not.toHaveBeenCalled();
      expect(lessonRepository.findAndCount).not.toHaveBeenCalled();
      expect(courseRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if a course does not have instructors', async () => {
      const notPublishedCourseDataMock = {
        ...courseDataMock,
        is_published: false,
      };
      const errorMock = new HttpException(
        'You cannot publish a course that does not have instructors',
        HttpStatus.BAD_REQUEST,
      );

      courseRepository.findOne.mockResolvedValue(notPublishedCourseDataMock);
      instructorCourseRepository.findOne.mockResolvedValue(null);

      await expect(coursesService.publishCourse(courseIdMock)).rejects.toThrow(
        errorMock,
      );
      expect(courseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseIdMock },
      });
      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: { course: { id: courseIdMock } },
      });
      expect(lessonRepository.findAndCount).not.toHaveBeenCalled();
      expect(courseRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if a course has less than 5 lessons', async () => {
      const notPublishedCourseDataMock = {
        ...courseDataMock,
        is_published: false,
      };
      const lessonsWithCountDataMock = [[lessonMockData], 0];
      const errorMock = new HttpException(
        'You cannot publish a course that has less than 5 lessons',
        HttpStatus.BAD_REQUEST,
      );

      courseRepository.findOne.mockResolvedValue(notPublishedCourseDataMock);
      instructorCourseRepository.findOne.mockResolvedValue(
        instructorCourseDataMock,
      );
      lessonRepository.findAndCount.mockResolvedValue(lessonsWithCountDataMock);

      await expect(coursesService.publishCourse(courseIdMock)).rejects.toThrow(
        errorMock,
      );
      expect(courseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseIdMock },
      });
      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: { course: { id: courseIdMock } },
      });
      expect(lessonRepository.findAndCount).toHaveBeenCalledWith({
        where: { course: { id: courseIdMock } },
      });
      expect(courseRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('createCourse', () => {
    it('should create course', async () => {
      courseRepository.save.mockResolvedValue(courseDataMock);

      const result = await coursesService.createCourse(createCourseDataMock);

      expect(courseRepository.save).toHaveBeenCalled();
      expect(result).toEqual(courseDataMock);
    });
  });

  describe('updateCourse', () => {
    it('should update course', async () => {
      courseRepository.findOne.mockResolvedValue(courseDataMock);
      courseRepository.save.mockResolvedValue(courseDataMock);

      const result = await coursesService.updateCourse(
        courseIdMock,
        createCourseDataMock,
      );

      expect(courseRepository.findOne).toHaveBeenCalled();
      expect(courseRepository.save).toHaveBeenCalled();
      expect(result).toEqual(courseDataMock);
    });
  });

  describe('assignInstructor', () => {
    it('should assign instructor for course', async () => {
      courseRepository.findOne.mockResolvedValue(courseDataMock);
      const getInstructorByIdSpy = jest.spyOn(
        mockedInstructorsService,
        'getInstructorById',
      );
      instructorCourseRepository.save.mockResolvedValue(courseDataMock);

      await coursesService.assignInstructor({
        courseId: courseIdMock,
        instructorId: instructorIdMock,
      });

      expect(courseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseIdMock },
      });
      expect(getInstructorByIdSpy).toHaveBeenCalledWith(instructorIdMock);
      expect(instructorCourseRepository.save).toHaveBeenCalled();
    });

    it('should throw an error', async () => {
      courseRepository.findOne.mockRejectedValue(notFoundError);
      const getInstructorByIdSpy = jest.spyOn(
        mockedInstructorsService,
        'getInstructorById',
      );

      try {
        await coursesService.assignInstructor({
          courseId: courseIdMock,
          instructorId: instructorIdMock,
        });
      } catch (err) {
        expect(getInstructorByIdSpy).not.toHaveBeenCalled();
        expect(instructorCourseRepository.save).not.toHaveBeenCalled();
        expect(err).toBe(notFoundError);
      }
    });

    it('should throw an error if user is already assigned to course', async () => {
      const errMock = new HttpException(
        'This user is already assigned to this course',
        HttpStatus.BAD_REQUEST,
      );

      courseRepository.findOne.mockResolvedValue(courseDataMock);
      const getInstructorByIdSpy = jest.spyOn(
        mockedInstructorsService,
        'getInstructorById',
      );
      instructorCourseRepository.save.mockRejectedValue({ code: '23505' });

      try {
        await coursesService.assignInstructor({
          courseId: courseIdMock,
          instructorId: instructorIdMock,
        });
      } catch (err) {
        expect(courseRepository.findOne).toHaveBeenCalledWith({
          where: { id: courseIdMock },
        });
        expect(getInstructorByIdSpy).toHaveBeenCalledWith(instructorIdMock);
        expect(instructorCourseRepository.save).toHaveBeenCalled();
        expect(err).toEqual(errMock);
      }
    });
  });

  describe('getCoursesByParams', () => {
    it('should get courses by params', async () => {
      courseRepository.find.mockResolvedValue([courseDataMock]);

      const result = await coursesService.getCoursesByParams({
        is_published: true,
      });

      expect(courseRepository.find).toHaveBeenCalledWith({
        where: { is_published: true },
      });
      expect(result).toEqual([courseDataMock]);
    });
  });

  describe('deleteCourseById', () => {
    it('should delete a course by id', async () => {
      courseRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

      await coursesService.deleteCourseById(courseIdMock);

      expect(courseRepository.delete).toHaveBeenCalledWith(courseIdMock);
    });

    it('should throw an error', async () => {
      courseRepository.delete.mockResolvedValue({ raw: [], affected: 0 });

      await expect(
        coursesService.deleteCourseById(courseIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('getCourseLessons', () => {
    it('should get a course lessons', async () => {
      courseRepository.findOne.mockResolvedValue(courseDataMock);

      await coursesService.getCourseLessons(courseIdMock);

      expect(courseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseIdMock },
        relations: { lessons: true },
      });
    });

    it('should throw an error', async () => {
      courseRepository.findOne.mockResolvedValue(null);

      await expect(
        coursesService.getCourseLessons(courseIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });
});
