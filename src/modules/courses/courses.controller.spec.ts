import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Course } from '../../db/entities/course/course.entity';
import { InstructorCourse } from '../../db/entities/instructor-course/instructor-course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { InstructorsService } from '../instructors/instructors.service';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../redis/redis.service';
import { AssignInstructorDto } from './dto/assign-instructor.dto';
import { GetCoursesByStatusDto } from './dto/get-courses-by-status.dto';
import { CreateCourseDto } from './dto/create-course.dto';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const courseIdMock = 'course-id';

describe('CoursesController', () => {
  let coursesController: CoursesController;
  let coursesService: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
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
          provide: AuthService,
          useValue: {},
        },
        {
          provide: InstructorsService,
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

    coursesService = module.get(CoursesService);
    coursesController = module.get(CoursesController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('assignInstructor', () => {
    it('should assign instructor for course', async () => {
      const dto = new AssignInstructorDto();

      jest
        .spyOn(coursesService, 'assignInstructor')
        .mockImplementation(() => Promise.resolve());

      await coursesController.assignInstructor(dto);

      expect(coursesService.assignInstructor).toBeCalledWith(dto);
    });
  });

  describe('getCoursesByStatus', () => {
    it('should get courses by status', async () => {
      const result = [new Course()];
      const dto = new GetCoursesByStatusDto();

      jest
        .spyOn(coursesService, 'getCoursesByParams')
        .mockImplementation(() => Promise.resolve(result));

      expect(await coursesController.getCoursesByStatus(dto)).toBe(result);
      expect(coursesService.getCoursesByParams).toBeCalledWith({
        is_published: dto.is_published,
      });
    });
  });

  describe('create', () => {
    it('should create course', async () => {
      const result = new Course();
      const dto = new CreateCourseDto();

      jest
        .spyOn(coursesService, 'createCourse')
        .mockImplementation(() => Promise.resolve(result));

      await coursesController.create(dto);

      expect(coursesService.createCourse).toBeCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update course', async () => {
      const result = new Course();
      const dto = new CreateCourseDto();

      jest
        .spyOn(coursesService, 'updateCourse')
        .mockImplementation(() => Promise.resolve(result));

      await coursesController.update(courseIdMock, dto);

      expect(coursesService.updateCourse).toBeCalledWith(courseIdMock, dto);
    });
  });

  describe('publishCourse', () => {
    it('should publish course', async () => {
      const result = new Course();

      jest
        .spyOn(coursesService, 'publishCourse')
        .mockImplementation(() => Promise.resolve(result));

      await coursesController.publishCourse(courseIdMock);

      expect(coursesService.publishCourse).toBeCalledWith(courseIdMock);
    });
  });

  describe('getCourseLessons', () => {
    it('should get course lessons', async () => {
      const result = new Course();

      jest
        .spyOn(coursesService, 'getCourseLessons')
        .mockImplementation(() => Promise.resolve(result));

      expect(await coursesController.getCourseLessons(courseIdMock)).toBe(
        result,
      );
      expect(coursesService.getCourseLessons).toBeCalledWith(courseIdMock);
    });
  });

  describe('getAll', () => {
    it('should get all published courses', async () => {
      const result = [new Course()];

      jest
        .spyOn(coursesService, 'getAllCourses')
        .mockImplementation(() => Promise.resolve(result));

      expect(await coursesController.getAll()).toBe(result);
      expect(coursesService.getAllCourses).toBeCalled();
    });
  });

  describe('delete', () => {
    it('should delete course', async () => {
      jest
        .spyOn(coursesService, 'deleteCourseById')
        .mockImplementation(() => Promise.resolve());

      await coursesController.delete(courseIdMock);

      expect(coursesService.deleteCourseById).toBeCalledWith(courseIdMock);
    });
  });
});
