import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Readable } from 'stream';
import { HttpException, HttpStatus } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../../config/config.service';
import { MailService } from '../mail/mail.service';
import { Student } from '../../db/entities/student/student.entity';
import { StudentCourse } from '../../db/entities/student-course/student-course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { EmailTemplates, UserRoles } from '../../constants';
import { CourseFeedback } from '../../db/entities/course-feedback/course-feedback.entity';
import { Homework } from '../../db/entities/homework/homework.entity';
import { StorageService } from '../storage/storage.service';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});
const mockedAuthService = {
  hashPassword: jest.fn(() => Promise.resolve(hashMock)),
  declineToken: jest.fn(() => Promise.resolve()),
};
const mockedMailService = {
  sendMail: jest.fn(() => Promise.resolve()),
};
const mockedStorageService = {
  get: jest.fn(() => Promise.resolve()),
  save: jest.fn(() => Promise.resolve()),
};
const mockedQueryRunnerManager = {
  save: jest.fn(() => Promise.resolve()),
};
const mockedQueryRunner = {
  connect: jest.fn(() => Promise.resolve()),
  startTransaction: jest.fn(() => Promise.resolve()),
  commitTransaction: jest.fn(() => Promise.resolve()),
  rollbackTransaction: jest.fn(() => Promise.resolve()),
  release: jest.fn(() => Promise.resolve()),
  manager: mockedQueryRunnerManager,
};

const studentIdMock = 'student-id';
const courseIdMock = 'course-id';
const lessonIdMock = 'lesson-id';
const homeworkIdMock = 'homework-id';
const hashMock = 'hash';
const createStudentDataMock = {
  first_name: 'New Admin',
  last_name: 'New Admin',
  email: 'email',
  password: '123456789',
  birth_date: '01.01.1990',
};
const createStudentByAdminDataMock = {
  ...createStudentDataMock,
  is_active: true,
};
const studentDataMock = {
  id: studentIdMock,
  first_name: createStudentDataMock.first_name,
  last_name: createStudentDataMock.last_name,
  email: createStudentDataMock.email,
  birth_date: createStudentDataMock.birth_date,
  is_active: createStudentByAdminDataMock.is_active,
  hash_password: hashMock,
  created_at: '2022-06-17T11:55:43.032Z',
  updated_at: '2022-06-17T11:55:43.032Z',
  role: UserRoles.STUDENT,
};
const courseDataDBMock = {
  id: 'id',
  studentId: studentIdMock,
  courseId: courseIdMock,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
  course: {
    id: courseIdMock,
    title: 'string',
    description: 'string',
    is_published: true,
    created_at: '2022-06-17T15:29:38.996Z',
    updated_at: '2022-06-17T15:29:38.996Z',
  },
};
const lessonDataMock = {
  id: 'id',
  title: 'Literature',
  description: 'Some text ',
  highest_mark: 100,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};
const messageAboutCreatingUser =
  'The account data have been sent to the administrator for verification. After verification, you will receive an email.';
const userExistError = new HttpException(
  'A user with this email already exists',
  HttpStatus.BAD_REQUEST,
);
const notFoundError = new HttpException('Data not found', HttpStatus.NOT_FOUND);
const courseFeedbackDataDBMock = {
  id: 'id',
  text: 'text',
  studentId: studentIdMock,
  courseId: courseIdMock,
  instructorId: 'instructorIdMock',
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};
const studentLessonDataMock = {
  id: lessonIdMock,
  title: 'Data types',
  description: 'Some lesson description',
  highest_mark: 100,
  created_at: '2022-07-16T10:46:47.567Z',
  updated_at: '2022-07-16T10:46:47.567Z',
};
const markDataMock = {
  id: 'bce91c8d-0a2d-44e2-9725-2a354355873b',
  mark: 90,
  created_at: '2022-07-16T11:02:34.981Z',
  updated_at: '2022-07-16T11:02:34.981Z',
};
const homeworkDataMock = {
  id: homeworkIdMock,
  created_at: '2022-07-22T13:34:20.461Z',
  updated_at: '2022-07-22T13:34:20.461Z',
};
const courseDataMock = {
  id: courseIdMock,
  final_mark: 67,
  is_course_pass: true,
  created_at: '2022-07-16T10:57:00.297Z',
  updated_at: '2022-07-16T10:57:00.297Z',
};

describe('StudentsService', () => {
  let studentsService: StudentsService;
  let studentRepository;
  let studentCourseRepository;
  let lessonRepository;
  let courseFeedbackRepository;
  let homeworkRepository;
  let studentMarkRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          provide: AuthService,
          useValue: mockedAuthService,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: mockedMailService,
        },
        {
          provide: StorageService,
          useValue: mockedStorageService,
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: () => mockedQueryRunner },
        },
      ],
    }).compile();

    studentsService = module.get(StudentsService);
    studentRepository = module.get(getRepositoryToken(Student));
    studentCourseRepository = module.get(getRepositoryToken(StudentCourse));
    lessonRepository = module.get(getRepositoryToken(Lesson));
    courseFeedbackRepository = module.get(getRepositoryToken(CourseFeedback));
    homeworkRepository = module.get(getRepositoryToken(Homework));
    studentMarkRepository = module.get(getRepositoryToken(StudentMark));
  });

  afterEach(() => jest.clearAllMocks());

  describe('createStudentByAdmin', () => {
    it('should create a student by admin', async () => {
      studentRepository.findOne.mockResolvedValue(null);
      studentRepository.save.mockResolvedValue(studentDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const result = await studentsService.createStudentByAdmin(
        createStudentByAdminDataMock,
      );

      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { email: createStudentByAdminDataMock.email },
      });
      expect(studentRepository.save).toHaveBeenCalled();
      expect(hashPasswordSpy).toHaveBeenCalledWith(
        createStudentByAdminDataMock.password,
      );
      expect(result).toBe(studentDataMock);
    });

    it('should throw an error', async () => {
      studentRepository.findOne.mockResolvedValue(studentDataMock);

      await expect(
        studentsService.createStudentByAdmin(createStudentByAdminDataMock),
      ).rejects.toThrow(userExistError);
    });
  });

  describe('getStudentByParams', () => {
    it('should get student by params', async () => {
      studentRepository.findOne.mockResolvedValue(studentDataMock);

      const result = await studentsService.getStudentByParams({
        email: studentDataMock.email,
      });

      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { email: studentDataMock.email },
      });
      expect(result).toEqual(studentDataMock);
    });
  });

  describe('getStudentByParams', () => {
    it('should get students by params', async () => {
      studentRepository.find.mockResolvedValue([studentDataMock]);

      const result = await studentsService.getStudentsByParams({
        email: studentDataMock.email,
      });

      expect(studentRepository.find).toHaveBeenCalledWith({
        where: { email: studentDataMock.email },
      });
      expect(result).toEqual([studentDataMock]);
    });
  });

  describe('createStudent', () => {
    it('should create an instructor', async () => {
      studentRepository.findOne.mockResolvedValue(null);
      studentRepository.save.mockResolvedValue(studentDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const result = await studentsService.createStudent(createStudentDataMock);

      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { email: createStudentDataMock.email },
      });
      expect(studentRepository.save).toHaveBeenCalled();
      expect(hashPasswordSpy).toHaveBeenCalledWith(
        createStudentDataMock.password,
      );
      expect(result).toBe(messageAboutCreatingUser);
    });

    it('should throw an error', async () => {
      studentRepository.findOne.mockResolvedValue(studentDataMock);

      await expect(
        studentsService.createStudent(createStudentDataMock),
      ).rejects.toThrow(userExistError);
    });
  });

  describe('updateStatus', () => {
    it('should update student is_active status', async () => {
      const updateStatusData = {
        is_active: true,
        send_email: true,
      };

      studentRepository.update.mockResolvedValue({
        generatedMaps: [],
        raw: [],
        affected: 1,
      });
      studentRepository.findOne.mockResolvedValue(studentDataMock);

      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');
      const sendMailSpy = jest.spyOn(mockedMailService, 'sendMail');

      const result = await studentsService.updateStatus(
        studentIdMock,
        updateStatusData,
      );

      expect(studentRepository.update).toHaveBeenCalledWith(studentIdMock, {
        is_active: updateStatusData.is_active,
      });
      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { id: studentIdMock },
      });
      expect(declineTokenSpy).toHaveBeenCalledWith(studentIdMock);
      expect(sendMailSpy).toHaveBeenCalledWith(
        studentDataMock.email,
        EmailTemplates.CHANGE_STATUS,
        'Account status',
        {
          name: `${studentDataMock.first_name} ${studentDataMock.last_name}`,
          status: updateStatusData.is_active,
        },
      );
      expect(result).toBe(studentDataMock);
    });
  });

  describe('getStudentById', () => {
    it('should get student by id', async () => {
      studentRepository.findOne.mockResolvedValue(studentDataMock);

      const result = await studentsService.getStudentById(studentIdMock);

      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { id: studentIdMock },
      });
      expect(result).toEqual(studentDataMock);
    });

    it('should throw an error', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      await expect(
        studentsService.getStudentById(studentIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('updateStudent', () => {
    it('should update instructor', async () => {
      const updateData = {
        first_name: 'Name',
        last_name: 'Name',
        password: 'password',
        birth_date: '01.01.1990',
      };

      studentRepository.findOne.mockResolvedValue(studentDataMock);
      studentRepository.save.mockResolvedValue(studentDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');

      const result = await studentsService.updateStudent(
        studentIdMock,
        updateData,
      );

      expect(studentRepository.save).toHaveBeenCalled();
      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { id: studentIdMock },
      });
      expect(hashPasswordSpy).toHaveBeenCalledWith(updateData.password);
      expect(declineTokenSpy).toHaveBeenCalledWith(studentIdMock);
      expect(result).toBe(studentDataMock);
    });
  });

  describe('getAllStudents', () => {
    it('should get all students', async () => {
      studentRepository.find.mockResolvedValue([studentDataMock]);

      const result = await studentsService.getAllStudents();

      expect(studentRepository.find).toHaveBeenCalled();
      expect(result).toEqual([studentDataMock]);
    });
  });

  describe('deleteStudentById', () => {
    it('should delete student by id', async () => {
      studentRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

      await studentsService.deleteStudentById(studentIdMock);

      expect(studentRepository.delete).toHaveBeenCalledWith(studentIdMock);
    });

    it('should throw an error', async () => {
      studentRepository.delete.mockResolvedValue({ raw: [], affected: 0 });

      await expect(
        studentsService.deleteStudentById(studentIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('takeCourse', () => {
    it('should delete student by id', async () => {
      studentCourseRepository.findAndCount.mockResolvedValue([[], 3]);
      studentCourseRepository.save.mockResolvedValue(studentDataMock);

      await studentsService.takeCourse(studentIdMock, courseIdMock);

      expect(studentCourseRepository.findAndCount).toHaveBeenCalledWith({
        where: { student: { id: studentIdMock } },
      });
      expect(studentCourseRepository.save).toHaveBeenCalledWith({
        student: { id: studentIdMock },
        course: { id: courseIdMock },
      });
    });

    it('should throw an error if student has more than 5 courses', async () => {
      const studentCoursesError = new HttpException(
        'You cannot attend more than 5 courses at the same time',
        HttpStatus.BAD_REQUEST,
      );

      studentCourseRepository.findAndCount.mockResolvedValue([[], 6]);

      await expect(
        studentsService.takeCourse(studentIdMock, courseIdMock),
      ).rejects.toThrow(studentCoursesError);
      expect(studentCourseRepository.findAndCount).toHaveBeenCalledWith({
        where: { student: { id: studentIdMock } },
      });
      expect(studentCourseRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if student has already taken a course', async () => {
      studentCourseRepository.findAndCount.mockResolvedValue([[], 3]);
      studentCourseRepository.save.mockRejectedValue({ code: '23505' });

      try {
        await studentsService.takeCourse(studentIdMock, courseIdMock);
      } catch (err) {
        expect(studentCourseRepository.findAndCount).toHaveBeenCalledWith({
          where: { student: { id: studentIdMock } },
        });
        expect(studentCourseRepository.save).toHaveBeenCalledWith({
          student: { id: studentIdMock },
          course: { id: courseIdMock },
        });
        expect(err).toEqual(
          new HttpException(
            'You have already taken this course',
            HttpStatus.BAD_REQUEST,
          ),
        );
      }
    });

    it('should throw an error if a course in not found', async () => {
      studentCourseRepository.findAndCount.mockResolvedValue([[], 3]);
      studentCourseRepository.save.mockRejectedValue({ code: '23503' });

      try {
        await studentsService.takeCourse(studentIdMock, courseIdMock);
      } catch (err) {
        expect(studentCourseRepository.findAndCount).toHaveBeenCalledWith({
          where: { student: { id: studentIdMock } },
        });
        expect(studentCourseRepository.save).toHaveBeenCalledWith({
          student: { id: studentIdMock },
          course: { id: courseIdMock },
        });
        expect(err).toEqual(
          new HttpException('Course not found', HttpStatus.BAD_REQUEST),
        );
      }
    });
  });

  describe('getStudentCourses', () => {
    it('should get student courses', async () => {
      studentCourseRepository.find.mockResolvedValue([courseDataDBMock]);

      const result = await studentsService.getStudentCourses(studentIdMock);

      expect(studentCourseRepository.find).toHaveBeenCalledWith({
        where: { student: { id: studentIdMock } },
        relations: { course: true },
      });
      expect(result).toEqual([courseDataDBMock.course]);
    });
  });

  describe('getStudentCourseLessons', () => {
    it('should get student course lessons', async () => {
      lessonRepository.find.mockResolvedValue([lessonDataMock]);

      const result = await studentsService.getStudentCourseLessons(
        studentIdMock,
        courseIdMock,
      );

      expect(lessonRepository.find).toHaveBeenCalledWith({
        where: {
          course: {
            id: courseIdMock,
            studentCourses: { student: { id: studentIdMock } },
          },
        },
      });
      expect(result).toEqual([lessonDataMock]);
    });
  });

  describe('getCourseFeedbacks', () => {
    it('should get student course feedbacks', async () => {
      courseFeedbackRepository.find.mockResolvedValue([
        courseFeedbackDataDBMock,
      ]);

      const result = await studentsService.getCourseFeedbacks(
        studentIdMock,
        courseIdMock,
      );

      expect(courseFeedbackRepository.find).toHaveBeenCalledWith({
        where: {
          student: { id: studentIdMock },
          course: {
            id: courseIdMock,
            studentCourses: { student: { id: studentIdMock } },
          },
        },
      });
      expect(result).toEqual([courseFeedbackDataDBMock]);
    });
  });

  describe('getLessonData', () => {
    it('should get student lesson data', async () => {
      lessonRepository.findOne.mockResolvedValue(studentLessonDataMock);
      homeworkRepository.findOne.mockResolvedValue(homeworkDataMock);
      studentMarkRepository.findOne.mockResolvedValue(markDataMock);

      const result = await studentsService.getLessonData(
        studentIdMock,
        courseIdMock,
        lessonIdMock,
      );

      expect(lessonRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: lessonIdMock,
          course: {
            id: courseIdMock,
            studentCourses: { student: { id: studentIdMock } },
          },
        },
      });
      expect(homeworkRepository.findOne).toHaveBeenCalledWith({
        where: {
          student: { id: studentIdMock },
          lesson: { id: lessonIdMock },
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
        },
      });
      expect(studentMarkRepository.findOne).toHaveBeenCalledWith({
        where: {
          student: { id: studentIdMock },
          lesson: { id: lessonIdMock },
        },
      });
      expect(result).toEqual({
        ...studentLessonDataMock,
        homework: homeworkDataMock,
        mark: markDataMock,
      });
    });

    it('should throw an error if lesson data is not found', async () => {
      lessonRepository.findOne.mockResolvedValue(null);

      await expect(
        studentsService.getLessonData(
          studentIdMock,
          courseIdMock,
          lessonIdMock,
        ),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
      expect(homeworkRepository.findOne).not.toHaveBeenCalled();
      expect(studentMarkRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getStudentCourseData', () => {
    it('should get student course data', async () => {
      studentCourseRepository.findOne.mockResolvedValue(courseDataMock);

      const result = await studentsService.getStudentCourseData(
        studentIdMock,
        courseIdMock,
      );

      expect(studentCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          student: { id: studentIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(result).toEqual(courseDataMock);
    });

    it('should throw an error if course data is not found', async () => {
      studentCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        studentsService.getStudentCourseData(studentIdMock, courseIdMock),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getHomeworkFile', () => {
    it('should get homework file', async () => {
      const homeworkDataWithFilePathMock = {
        ...homeworkDataMock,
        file_path: 'file_path',
      };

      homeworkRepository.findOne.mockResolvedValue(
        homeworkDataWithFilePathMock,
      );

      const getFileSpy = jest.spyOn(mockedStorageService, 'get');

      await studentsService.getHomeworkFile(studentIdMock, homeworkIdMock);

      expect(homeworkRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: homeworkIdMock,
          student: { id: studentIdMock },
        },
      });
      expect(getFileSpy).toHaveBeenCalledWith(
        homeworkDataWithFilePathMock.file_path,
      );
    });

    it('should throw an error if homework file is not found', async () => {
      homeworkRepository.findOne.mockResolvedValue(null);

      await expect(
        studentsService.getHomeworkFile(studentIdMock, homeworkIdMock),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('uploadHomeworkFile', () => {
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

    it('should upload homework file', async () => {
      studentCourseRepository.findOne.mockResolvedValue(courseDataMock);

      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerManagerSaveSpy = jest.spyOn(
        mockedQueryRunnerManager,
        'save',
      );
      const saveFileSpy = jest.spyOn(mockedStorageService, 'save');
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');

      await studentsService.uploadHomeworkFile(
        studentIdMock,
        courseIdMock,
        lessonIdMock,
        fileMock,
      );

      expect(studentCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          student: { id: studentIdMock },
          course: {
            id: courseIdMock,
            lessons: { id: lessonIdMock },
          },
        },
      });
      expect(queryRunnerConnectSpy).toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).toHaveBeenCalled();
      expect(queryRunnerManagerSaveSpy).toHaveBeenCalled();
      expect(saveFileSpy).toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).toHaveBeenCalled();
    });

    it('should throw an error if course is not found', async () => {
      studentCourseRepository.findOne.mockResolvedValue(null);

      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerManagerSaveSpy = jest.spyOn(
        mockedQueryRunnerManager,
        'save',
      );
      const saveFileSpy = jest.spyOn(mockedStorageService, 'save');
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');

      await expect(
        studentsService.uploadHomeworkFile(
          studentIdMock,
          courseIdMock,
          lessonIdMock,
          fileMock,
        ),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
      expect(studentCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          student: { id: studentIdMock },
          course: {
            id: courseIdMock,
            lessons: { id: lessonIdMock },
          },
        },
      });
      expect(queryRunnerConnectSpy).not.toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerManagerSaveSpy).not.toHaveBeenCalled();
      expect(saveFileSpy).not.toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if file has already been uploaded', async () => {
      studentCourseRepository.findOne.mockResolvedValue(courseDataMock);

      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerManagerSaveSpy = jest
        .spyOn(mockedQueryRunnerManager, 'save')
        .mockRejectedValue({ code: '23505' });
      const saveFileSpy = jest.spyOn(mockedStorageService, 'save');
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');

      try {
        await studentsService.uploadHomeworkFile(
          studentIdMock,
          courseIdMock,
          lessonIdMock,
          fileMock,
        );
      } catch (err) {
        expect(studentCourseRepository.findOne).toHaveBeenCalledWith({
          where: {
            student: { id: studentIdMock },
            course: {
              id: courseIdMock,
              lessons: { id: lessonIdMock },
            },
          },
        });
        expect(queryRunnerConnectSpy).toHaveBeenCalled();
        expect(queryRunnerStartTransactionSpy).toHaveBeenCalled();
        expect(queryRunnerManagerSaveSpy).toHaveBeenCalled();
        expect(saveFileSpy).not.toHaveBeenCalled();
        expect(queryRunnerCommitTransactionSpy).not.toHaveBeenCalled();
        expect(queryRunnerRollbackTransactionSpy).toHaveBeenCalled();
        expect(queryRunnerReleaseSpy).toHaveBeenCalled();
        expect(err).toEqual(
          new HttpException(
            'You have already uploaded the homework for this lesson',
            HttpStatus.BAD_REQUEST,
          ),
        );
      }
    });
  });
});
