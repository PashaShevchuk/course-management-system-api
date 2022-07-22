import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { Student } from '../../db/entities/student/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentCourse } from '../../db/entities/student-course/student-course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { CreateStudentByAdminDto } from './dto/create-student-by-admin.dto';
import { TakeCourseDto } from './dto/take-course.dto';
import { GetStudentsByStatusDto } from './dto/get-students--by-status.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Course } from '../../db/entities/course/course.entity';
import { CourseFeedback } from '../../db/entities/course-feedback/course-feedback.entity';
import { Homework } from '../../db/entities/homework/homework.entity';
import { StorageService } from '../storage/storage.service';
import { studentLessonDataExampleDto } from './dto/student-lesson-data-example.dto';
import { DataSource } from 'typeorm';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const studentIdMock = 'student-id';
const courseIdMock = 'course-id';
const lessonIdMock = 'lesson-id';

describe('StudentsController', () => {
  let studentsController: StudentsController;
  let studentsService: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(StudentCourse),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Lesson),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(CourseFeedback),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Homework),
          useFactory: mockRepository,
        },
        {
          provide: StorageService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
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
        {
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile();

    studentsService = module.get(StudentsService);
    studentsController = module.get(StudentsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('registration', () => {
    it('should register user', async () => {
      const result = 'massage-about-registration';
      const dto = new CreateStudentDto();

      jest
        .spyOn(studentsService, 'createStudent')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.registration(dto)).toBe(result);
    });
  });

  describe('createByAdmin', () => {
    it('should create student by admin', async () => {
      const result = new Student();
      const dto = new CreateStudentByAdminDto();

      jest
        .spyOn(studentsService, 'createStudentByAdmin')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.createByAdmin(dto)).toBe(result);
    });
  });

  describe('takeCourse', () => {
    it('should take a course', async () => {
      const dto = new TakeCourseDto();
      const reqMock = { user: { id: studentIdMock } };

      jest
        .spyOn(studentsService, 'takeCourse')
        .mockImplementation(() => Promise.resolve());

      await studentsController.takeCourse(reqMock, dto);

      expect(studentsService.takeCourse).toHaveBeenCalledWith(
        reqMock.user.id,
        dto.course_id,
      );
    });
  });

  describe('getStudentsByStatus', () => {
    it('should get students by status', async () => {
      const result = [new Student()];
      const dto = new GetStudentsByStatusDto();

      jest
        .spyOn(studentsService, 'getStudentsByParams')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.getStudentsByStatus(dto)).toBe(result);
    });
  });

  describe('updateStatus', () => {
    it('should update student is_active status', async () => {
      const result = new Student();
      const dto = new UpdateStudentStatusDto();

      jest
        .spyOn(studentsService, 'updateStatus')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.updateStatus(studentIdMock, dto)).toBe(
        result,
      );
    });
  });

  describe('update', () => {
    it('should update student', async () => {
      const result = new Student();
      const dto = new UpdateStudentDto();
      const reqMock = { user: { id: studentIdMock } };

      jest
        .spyOn(studentsService, 'updateStudent')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.update(reqMock, dto)).toBe(result);
    });
  });

  describe('getStudentCourses', () => {
    it('should get student courses', async () => {
      const result = [new Course()];
      const reqMock = { user: { id: studentIdMock } };

      jest
        .spyOn(studentsService, 'getStudentCourses')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.getStudentCourses(reqMock)).toBe(result);
    });
  });

  describe('getStudentCourseLessons', () => {
    it('should get student course lessons', async () => {
      const result = [new Lesson()];
      const reqMock = { user: { id: studentIdMock } };

      jest
        .spyOn(studentsService, 'getStudentCourseLessons')
        .mockImplementation(() => Promise.resolve(result));

      expect(
        await studentsController.getStudentCourseLessons(
          reqMock,
          studentIdMock,
        ),
      ).toBe(result);
    });
  });

  describe('getAll', () => {
    it('should get all students', async () => {
      const result = [new Student()];

      jest
        .spyOn(studentsService, 'getAllStudents')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.getAll()).toBe(result);
    });
  });

  describe('getOneByAdmin', () => {
    it('should get student by ID by admin', async () => {
      const result = new Student();

      jest
        .spyOn(studentsService, 'getStudentById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.getOneByAdmin(studentIdMock)).toBe(
        result,
      );
    });
  });

  describe('getOne', () => {
    it('should get student by ID', async () => {
      const result = new Student();
      const reqMock = { user: { id: studentIdMock } };

      jest
        .spyOn(studentsService, 'getStudentById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await studentsController.getOne(reqMock)).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete student by ID', async () => {
      jest
        .spyOn(studentsService, 'deleteStudentById')
        .mockImplementation(() => Promise.resolve());

      await studentsController.delete(studentIdMock);

      expect(studentsService.deleteStudentById).toBeCalledWith(studentIdMock);
    });
  });

  describe('getCourseFeedbacks', () => {
    it('should get student course feedback', async () => {
      const reqMock = { user: { id: studentIdMock } };
      const result = new CourseFeedback();

      jest
        .spyOn(studentsService, 'getCourseFeedback')
        .mockImplementation(() => Promise.resolve(result));

      await studentsController.getCourseFeedback(reqMock, studentIdMock);

      expect(studentsService.getCourseFeedback).toHaveBeenCalledWith(
        reqMock.user.id,
        studentIdMock,
      );
      expect(
        await studentsController.getCourseFeedback(reqMock, studentIdMock),
      ).toBe(result);
    });
  });

  describe('getLessonData', () => {
    it('should get student lesson data', async () => {
      const reqMock = { user: { id: studentIdMock } };
      const result = { ...studentLessonDataExampleDto };

      jest
        .spyOn(studentsService, 'getLessonData')
        .mockImplementation(() => Promise.resolve(result));

      expect(
        await studentsController.getLessonData(
          reqMock,
          courseIdMock,
          lessonIdMock,
        ),
      ).toBe(result);
      expect(studentsService.getLessonData).toHaveBeenCalledWith(
        reqMock.user.id,
        courseIdMock,
        lessonIdMock,
      );
    });
  });
});
