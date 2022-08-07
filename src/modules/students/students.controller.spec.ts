import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as httpMocks from 'node-mocks-http';
import { Readable } from 'stream';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
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
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';
import { UploadHomeworkFileDto } from './dto/upload-homework-file.dto';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

let resMock;

const studentIdMock = 'student-id';
const courseIdMock = 'course-id';
const lessonIdMock = 'lesson-id';
const homeworkIdMock = 'homework-id';

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
          provide: getRepositoryToken(StudentMark),
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

    resMock = httpMocks.createResponse();

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
      const result = [new CourseFeedback()];

      jest
        .spyOn(studentsService, 'getCourseFeedbacks')
        .mockImplementation(() => Promise.resolve(result));

      expect(
        await studentsController.getCourseFeedbacks(reqMock, studentIdMock),
      ).toBe(result);
      expect(studentsService.getCourseFeedbacks).toHaveBeenCalledWith(
        reqMock.user.id,
        studentIdMock,
      );
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

  describe('uploadHomeworkFile', () => {
    it('should upload a homework file', async () => {
      const reqMock = { user: { id: studentIdMock } };
      const dto = new UploadHomeworkFileDto();
      const buffer = Buffer.from('file content');
      const mockReadableStream = Readable.from(buffer);
      const fileMock = {
        buffer: buffer,
        fieldname: 'fieldname',
        originalname: 'original-filename',
        encoding: '7bit',
        mimetype: 'file-mimetype',
        destination: 'destination-path',
        filename: 'file-name',
        path: 'file-path',
        size: 955578,
        stream: mockReadableStream,
      };

      jest
        .spyOn(studentsService, 'uploadHomeworkFile')
        .mockImplementation(() => Promise.resolve());

      await studentsController.uploadHomeworkFile(reqMock, dto, fileMock);

      expect(studentsService.uploadHomeworkFile).toHaveBeenCalledWith(
        reqMock.user.id,
        dto.course_id,
        dto.lesson_id,
        fileMock,
      );
    });
  });

  describe('getHomeworkFile', () => {
    it('should get a homework file', async () => {
      const reqMock = { user: { id: studentIdMock } };
      const buffer = Buffer.from('file content');
      const mockReadableStream = Readable.from(buffer);
      const fileMock = {
        contentType: 'text/html',
        stream: mockReadableStream,
      };

      jest
        .spyOn(studentsService, 'getHomeworkFile')
        .mockImplementation(() => Promise.resolve(fileMock));

      await studentsController.getHomeworkFile(
        homeworkIdMock,
        reqMock,
        resMock,
      );

      expect(studentsService.getHomeworkFile).toHaveBeenCalledWith(
        reqMock.user.id,
        homeworkIdMock,
      );
    });
  });

  describe('getStudentCourseData', () => {
    it('should get student course data', async () => {
      const reqMock = { user: { id: courseIdMock } };
      const result = new StudentCourse();

      jest
        .spyOn(studentsService, 'getStudentCourseData')
        .mockImplementation(() => Promise.resolve(result));

      expect(
        await studentsController.getStudentCourseData(reqMock, courseIdMock),
      ).toBe(result);
      expect(studentsService.getStudentCourseData).toHaveBeenCalledWith(
        reqMock.user.id,
        courseIdMock,
      );
    });
  });
});
