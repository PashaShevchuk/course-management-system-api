import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../../config/config.service';
import { MailService } from '../mail/mail.service';
import { InstructorsService } from './instructors.service';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { EmailTemplates, UserRoles } from '../../constants';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { StudentCourse } from '../../db/entities/student-course/student-course.entity';
import { InstructorCourse } from '../../db/entities/instructor-course/instructor-course.entity';
import { CourseFeedback } from '../../db/entities/course-feedback/course-feedback.entity';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';
import { DataSource } from 'typeorm';
import { Homework } from '../../db/entities/homework/homework.entity';
import { StorageService } from '../storage/storage.service';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
  })),
  query: jest.fn(),
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
  delete: jest.fn(() => Promise.resolve()),
};
const mockedQueryRunnerManager = {
  save: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
};
const mockedQueryRunner = {
  connect: jest.fn(() => Promise.resolve()),
  startTransaction: jest.fn(() => Promise.resolve()),
  commitTransaction: jest.fn(() => Promise.resolve()),
  rollbackTransaction: jest.fn(() => Promise.resolve()),
  release: jest.fn(() => Promise.resolve()),
  manager: mockedQueryRunnerManager,
};

const instructorIdMock = 'instructor-id';
const hashMock = 'hash';
const studentIdMock = 'student-id';
const courseIdMock = 'course-id';
const feedbackIdMock = 'feedback-id';
const lessonIdMock = 'lesson-id';
const markIdMock = 'mark-id';
const homeworkIdMock = 'homework-id';
const createInstructorDataMock = {
  first_name: 'New Admin',
  last_name: 'New Admin',
  email: 'email',
  password: '123456789',
  position: 'Middle',
};
const createInstructorByAdminDataMock = {
  ...createInstructorDataMock,
  is_active: true,
};
const instructorDataMock = {
  id: instructorIdMock,
  first_name: createInstructorDataMock.first_name,
  last_name: createInstructorDataMock.last_name,
  email: createInstructorDataMock.email,
  position: createInstructorDataMock.position,
  is_active: createInstructorByAdminDataMock.is_active,
  hash_password: hashMock,
  created_at: '2022-06-17T11:55:43.032Z',
  updated_at: '2022-06-17T11:55:43.032Z',
  role: UserRoles.INSTRUCTOR,
};
const messageAboutCreatingUser =
  'The account data have been sent to the administrator for verification. After verification, you will receive an email.';
const userExistError = new HttpException(
  'A user with this email already exists',
  HttpStatus.BAD_REQUEST,
);
const notFoundError = new HttpException('Data not found', HttpStatus.NOT_FOUND);
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
const studentDataMock = {
  id: studentIdMock,
  first_name: 'first_name',
  last_name: 'last_name',
  email: 'email',
  birth_date: '01.01.1990',
  is_active: true,
  created_at: '2022-06-17T11:55:43.032Z',
  updated_at: '2022-06-17T11:55:43.032Z',
  role: UserRoles.STUDENT,
};
const studentCourseDataDBMock = {
  id: 'id',
  studentId: studentIdMock,
  courseId: courseIdMock,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
  student: studentDataMock,
};
const courseFeedbackDataDBMock = {
  id: feedbackIdMock,
  text: 'text',
  studentId: studentIdMock,
  courseId: courseIdMock,
  instructorId: instructorIdMock,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};
const studentMarkDataMock = {
  id: markIdMock,
  mark: 100,
  student_id: studentIdMock,
  lesson_id: lessonIdMock,
  created_at: '2022-06-17T15:29:38.996Z',
  updated_at: '2022-06-17T15:29:38.996Z',
};
const lessonMarkDataMock = {
  id: lessonIdMock,
  mark: 10,
  created_at: '2022-07-10T09:34:44.807Z',
  updated_at: '2022-07-10T09:34:44.807Z',
  student: {
    id: 'a1e8a51f-55fb-41a0-9106-6eed481c47db',
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
const lessonHomeworkData = {
  id: homeworkIdMock,
  created_at: '2022-07-22T13:34:20.461Z',
  updated_at: '2022-07-22T13:34:20.461Z',
  student: {
    id: studentIdMock,
    first_name: 'John',
    last_name: 'Doe',
  },
};

describe('InstructorsService', () => {
  let instructorsService: InstructorsService;
  let instructorRepository;
  let studentCourseRepository;
  let instructorCourseRepository;
  let lessonRepository;
  let courseFeedbackRepository;
  let studentMarkRepository;
  let homeworkRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorsService,
        {
          provide: getRepositoryToken(Instructor),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(InstructorCourse),
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
          provide: getRepositoryToken(StudentMark),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Homework),
          useFactory: mockRepository,
        },
        {
          provide: StorageService,
          useValue: mockedStorageService,
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: () => mockedQueryRunner },
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
      ],
    }).compile();

    instructorsService = module.get(InstructorsService);
    instructorRepository = module.get(getRepositoryToken(Instructor));
    studentCourseRepository = module.get(getRepositoryToken(StudentCourse));
    instructorCourseRepository = module.get(
      getRepositoryToken(InstructorCourse),
    );
    lessonRepository = module.get(getRepositoryToken(Lesson));
    courseFeedbackRepository = module.get(getRepositoryToken(CourseFeedback));
    studentMarkRepository = module.get(getRepositoryToken(StudentMark));
    homeworkRepository = module.get(getRepositoryToken(Homework));
  });

  afterEach(() => jest.clearAllMocks());

  describe('createInstructorByAdmin', () => {
    it('should create an instructor by admin', async () => {
      instructorRepository.findOne.mockResolvedValue(null);
      instructorRepository.save.mockResolvedValue(instructorDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const result = await instructorsService.createInstructorByAdmin(
        createInstructorByAdminDataMock,
      );

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { email: createInstructorByAdminDataMock.email },
      });
      expect(instructorRepository.save).toHaveBeenCalled();
      expect(hashPasswordSpy).toHaveBeenCalledWith(
        createInstructorByAdminDataMock.password,
      );
      expect(result).toBe(instructorDataMock);
    });

    it('should throw an error', async () => {
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      await expect(
        instructorsService.createInstructorByAdmin(
          createInstructorByAdminDataMock,
        ),
      ).rejects.toThrow(userExistError);
    });
  });

  describe('getInstructorByParams', () => {
    it('should get instructor by params', async () => {
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      const result = await instructorsService.getInstructorByParams({
        email: createInstructorDataMock.email,
      });

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { email: createInstructorDataMock.email },
      });
      expect(result).toEqual(instructorDataMock);
    });
  });

  describe('getInstructorsByParams', () => {
    it('should get instructors by params', async () => {
      instructorRepository.find.mockResolvedValue([instructorDataMock]);

      const result = await instructorsService.getInstructorsByParams({
        email: createInstructorDataMock.email,
      });

      expect(instructorRepository.find).toHaveBeenCalledWith({
        where: { email: createInstructorDataMock.email },
      });
      expect(result).toEqual([instructorDataMock]);
    });
  });

  describe('createInstructor', () => {
    it('should create an instructor', async () => {
      instructorRepository.findOne.mockResolvedValue(null);
      instructorRepository.save.mockResolvedValue(instructorDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const result = await instructorsService.createInstructor(
        createInstructorDataMock,
      );

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { email: createInstructorDataMock.email },
      });
      expect(instructorRepository.save).toHaveBeenCalled();
      expect(hashPasswordSpy).toHaveBeenCalledWith(
        createInstructorDataMock.password,
      );
      expect(result).toBe(messageAboutCreatingUser);
    });

    it('should throw an error', async () => {
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      await expect(
        instructorsService.createInstructor(createInstructorDataMock),
      ).rejects.toThrow(userExistError);
    });
  });

  describe('getInstructorById', () => {
    it('should get instructor by id', async () => {
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      const result = await instructorsService.getInstructorById(
        instructorIdMock,
      );

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { id: instructorIdMock },
      });
      expect(result).toEqual(instructorDataMock);
    });

    it('should throw an error', async () => {
      instructorRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.getInstructorById(instructorIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('updateStatus', () => {
    it('should update instructor is_active status', async () => {
      const updateStatusData = {
        is_active: true,
        send_email: true,
      };

      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');
      const instructorRepositoryQueryBuilderSpy = jest.spyOn(
        instructorRepository,
        'createQueryBuilder',
      );

      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');
      const sendMailSpy = jest.spyOn(mockedMailService, 'sendMail');

      const result = await instructorsService.updateStatus(
        instructorIdMock,
        updateStatusData,
      );

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { id: instructorIdMock },
      });
      expect(declineTokenSpy).toHaveBeenCalledWith(instructorIdMock);
      expect(sendMailSpy).toHaveBeenCalledWith(
        instructorDataMock.email,
        EmailTemplates.CHANGE_STATUS,
        'Account status',
        {
          name: `${instructorDataMock.first_name} ${instructorDataMock.last_name}`,
          status: updateStatusData.is_active,
        },
      );
      expect(queryRunnerConnectSpy).toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).toHaveBeenCalled();
      expect(instructorRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).toHaveBeenCalled();
      expect(result).toBe(instructorDataMock);
    });
  });

  describe('updateInstructor', () => {
    it('should update instructor', async () => {
      const updateData = {
        first_name: 'Name',
        last_name: 'Name',
        password: 'password',
        position: 'position',
      };

      instructorRepository.findOne.mockResolvedValue(instructorDataMock);
      instructorRepository.save.mockResolvedValue(instructorDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');

      const result = await instructorsService.updateInstructor(
        instructorIdMock,
        updateData,
      );

      expect(instructorRepository.save).toHaveBeenCalled();
      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { id: instructorIdMock },
      });
      expect(hashPasswordSpy).toHaveBeenCalledWith(updateData.password);
      expect(declineTokenSpy).toHaveBeenCalledWith(instructorIdMock);
      expect(result).toBe(instructorDataMock);
    });
  });

  describe('getAllInstructors', () => {
    it('should get all instructors', async () => {
      instructorRepository.find.mockResolvedValue([instructorDataMock]);

      const result = await instructorsService.getAllInstructors();

      expect(instructorRepository.find).toHaveBeenCalled();
      expect(result).toEqual([instructorDataMock]);
    });
  });

  describe('deleteInstructorById', () => {
    it('should delete instructor by id', async () => {
      instructorRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');

      await instructorsService.deleteInstructorById(instructorIdMock);

      expect(instructorRepository.delete).toHaveBeenCalledWith(
        instructorIdMock,
      );
      expect(declineTokenSpy).toHaveBeenCalledWith(instructorIdMock);
    });

    it('should throw an error', async () => {
      instructorRepository.delete.mockResolvedValue({ raw: [], affected: 0 });

      await expect(
        instructorsService.deleteInstructorById(instructorIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('getInstructorCourses', () => {
    it('should get instructor courses', async () => {
      instructorCourseRepository.find.mockResolvedValue([courseDataDBMock]);

      const result = await instructorsService.getInstructorCourses(
        instructorIdMock,
      );

      expect(instructorCourseRepository.find).toHaveBeenCalledWith({
        where: { instructor: { id: instructorIdMock } },
        relations: { course: true },
      });
      expect(result).toEqual([courseDataDBMock.course]);
    });
  });

  describe('getInstructorCourseLessons', () => {
    it('should get instructor course lessons', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      lessonRepository.find.mockResolvedValue([lessonDataMock]);

      const result = await instructorsService.getInstructorCourseLessons(
        instructorIdMock,
        courseIdMock,
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepository.find).toHaveBeenCalledWith({
        where: { course: { id: courseIdMock } },
      });
      expect(result).toEqual([lessonDataMock]);
    });

    it('should throw an error', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.getInstructorCourseLessons(
          instructorIdMock,
          courseIdMock,
        ),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('getInstructorCourseStudents', () => {
    it('should get instructor course students', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      studentCourseRepository.find.mockResolvedValue([studentCourseDataDBMock]);

      const result = await instructorsService.getInstructorCourseStudents(
        instructorIdMock,
        courseIdMock,
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(studentCourseRepository.find).toHaveBeenCalledWith({
        where: { course: { id: courseIdMock } },
        relations: { student: true },
      });
      expect(result).toEqual([studentCourseDataDBMock.student]);
    });

    it('should throw an error', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.getInstructorCourseStudents(
          instructorIdMock,
          courseIdMock,
        ),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('createCourseFeedback', () => {
    const createFeedbackDataMock = {
      text: 'text',
      student_id: studentIdMock,
    };

    it('should create course feedback', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      studentCourseRepository.findOne.mockResolvedValue(
        studentCourseDataDBMock,
      );
      courseFeedbackRepository.save.mockResolvedValue(courseFeedbackDataDBMock);

      await instructorsService.createCourseFeedback(
        instructorIdMock,
        courseIdMock,
        createFeedbackDataMock,
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(studentCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          course: { id: courseIdMock },
          student: { id: createFeedbackDataMock.student_id },
        },
      });
      expect(courseFeedbackRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if course is not found', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.createCourseFeedback(
          instructorIdMock,
          courseIdMock,
          createFeedbackDataMock,
        ),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if student is not found', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      studentCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.createCourseFeedback(
          instructorIdMock,
          courseIdMock,
          createFeedbackDataMock,
        ),
      ).rejects.toThrow(
        new HttpException('Student not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if instructor has already left feedback', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      studentCourseRepository.findOne.mockResolvedValue(
        studentCourseDataDBMock,
      );
      courseFeedbackRepository.save.mockRejectedValue({ code: '23505' });

      try {
        await instructorsService.createCourseFeedback(
          instructorIdMock,
          courseIdMock,
          createFeedbackDataMock,
        );
      } catch (err) {
        expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
          where: {
            instructor: { id: instructorIdMock },
            course: { id: courseIdMock },
          },
        });
        expect(studentCourseRepository.findOne).toHaveBeenCalledWith({
          where: {
            course: { id: courseIdMock },
            student: { id: createFeedbackDataMock.student_id },
          },
        });
        expect(courseFeedbackRepository.save).toHaveBeenCalled();
        expect(err).toEqual(
          new HttpException(
            'You have already left feedback for this student',
            HttpStatus.BAD_REQUEST,
          ),
        );
      }
    });

    it('should throw an error', async () => {
      const customErr = new Error('message');

      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      studentCourseRepository.findOne.mockResolvedValue(
        studentCourseDataDBMock,
      );
      courseFeedbackRepository.save.mockRejectedValue(customErr);

      await expect(
        instructorsService.createCourseFeedback(
          instructorIdMock,
          courseIdMock,
          createFeedbackDataMock,
        ),
      ).rejects.toThrow(customErr);
    });
  });

  describe('getCourseFeedbacks', () => {
    it('should get instructor course feedbacks', async () => {
      instructorCourseRepository.findOne.mockResolvedValue({
        course: { courseFeedbacks: [courseFeedbackDataDBMock] },
      });

      const result = await instructorsService.getCourseFeedbacks(
        instructorIdMock,
        courseIdMock,
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          course: {
            id: courseIdMock,
            courseFeedbacks: {
              instructor: { id: instructorIdMock },
            },
          },
          instructor: { id: instructorIdMock },
        },
        relations: {
          course: { courseFeedbacks: true },
        },
      });
      expect(result).toEqual([courseFeedbackDataDBMock]);
    });

    it('should throw an error if course is not found', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.getCourseFeedbacks(instructorIdMock, courseIdMock),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateCourseFeedback', () => {
    const updateFeedbackData = {
      feedback_id: feedbackIdMock,
      text: 'some text',
    };

    it('should update instructor course feedback', async () => {
      courseFeedbackRepository.findOne.mockResolvedValue(
        courseFeedbackDataDBMock,
      );
      courseFeedbackRepository.save.mockResolvedValue(courseFeedbackDataDBMock);

      await instructorsService.updateCourseFeedback(
        instructorIdMock,
        courseIdMock,
        updateFeedbackData,
      );

      expect(courseFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: {
          course: { id: courseIdMock },
          instructor: { id: instructorIdMock },
          id: updateFeedbackData.feedback_id,
        },
      });
      expect(courseFeedbackRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if feedback is not found', async () => {
      courseFeedbackRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.updateCourseFeedback(
          instructorIdMock,
          courseIdMock,
          updateFeedbackData,
        ),
      ).rejects.toThrow(
        new HttpException('Feedback not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('deleteCourseFeedback', () => {
    it('should delete instructor course feedback', async () => {
      courseFeedbackRepository.delete.mockResolvedValue({
        raw: [],
        affected: 1,
      });

      await instructorsService.deleteCourseFeedback(
        instructorIdMock,
        courseIdMock,
        feedbackIdMock,
      );

      expect(courseFeedbackRepository.delete).toHaveBeenCalledWith({
        id: feedbackIdMock,
        instructor: { id: instructorIdMock },
        course: { id: courseIdMock },
      });
    });

    it('should throw an error', async () => {
      courseFeedbackRepository.delete.mockResolvedValue({
        raw: [],
        affected: 0,
      });

      await expect(
        instructorsService.deleteCourseFeedback(
          instructorIdMock,
          courseIdMock,
          feedbackIdMock,
        ),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('putMarkForStudent', () => {
    const markDataMock = {
      mark: 80,
      student_id: studentIdMock,
      lesson_id: lessonIdMock,
      course_id: courseIdMock,
    };

    it('should put mark for student', async () => {
      lessonRepository.findOne.mockResolvedValue(lessonDataMock);
      studentMarkRepository.save.mockResolvedValue();

      await instructorsService.putMarkForStudent(
        instructorIdMock,
        markDataMock,
      );

      expect(lessonRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: markDataMock.lesson_id,
          course: {
            id: markDataMock.course_id,
            instructorCourses: { instructor: { id: instructorIdMock } },
            studentCourses: { student: { id: markDataMock.student_id } },
          },
        },
      });
      expect(studentMarkRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if a lesson is not found', async () => {
      lessonRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.putMarkForStudent(instructorIdMock, markDataMock),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if a mark in higher than lesson highest mark', async () => {
      const markDataMock = {
        mark: 110,
        student_id: studentIdMock,
        lesson_id: lessonIdMock,
        course_id: courseIdMock,
      };

      lessonRepository.findOne.mockResolvedValue(lessonDataMock);

      await expect(
        instructorsService.putMarkForStudent(instructorIdMock, markDataMock),
      ).rejects.toThrow(
        new HttpException(
          `The highest mark for this lesson is ${lessonDataMock.highest_mark}`,
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if instructor has already put a mark', async () => {
      lessonRepository.findOne.mockResolvedValue(lessonDataMock);
      studentMarkRepository.save.mockRejectedValue({ code: '23505' });

      try {
        await instructorsService.putMarkForStudent(
          instructorIdMock,
          markDataMock,
        );
      } catch (err) {
        expect(lessonRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: markDataMock.lesson_id,
            course: {
              id: markDataMock.course_id,
              instructorCourses: { instructor: { id: instructorIdMock } },
              studentCourses: { student: { id: markDataMock.student_id } },
            },
          },
        });
        expect(studentMarkRepository.save).toHaveBeenCalled();
        expect(err).toEqual(
          new HttpException(
            'You have already put a mark for this student',
            HttpStatus.BAD_REQUEST,
          ),
        );
      }
    });

    it('should throw an error', async () => {
      const customErr = new Error('message');

      lessonRepository.findOne.mockResolvedValue(lessonDataMock);
      studentMarkRepository.save.mockRejectedValue(customErr);

      await expect(
        instructorsService.putMarkForStudent(instructorIdMock, markDataMock),
      ).rejects.toThrow(customErr);
    });
  });

  describe('updateStudentMark', () => {
    const markUpdateDataMock = {
      mark_id: markIdMock,
      mark: 80,
    };

    it('should update student mark', async () => {
      studentMarkRepository.findOne.mockResolvedValue(studentMarkDataMock);

      await instructorsService.updateStudentMark(
        instructorIdMock,
        markUpdateDataMock,
      );

      expect(studentMarkRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: markUpdateDataMock.mark_id,
          lesson: {
            course: {
              instructorCourses: { instructor: { id: instructorIdMock } },
            },
          },
        },
      });
      expect(studentMarkRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if a lesson is not found', async () => {
      studentMarkRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.updateStudentMark(
          instructorIdMock,
          markUpdateDataMock,
        ),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getLessonMarks', () => {
    it('should get lesson marks', async () => {
      studentMarkRepository.find.mockResolvedValue([lessonMarkDataMock]);

      const result = await instructorsService.getLessonMarks(
        instructorIdMock,
        courseIdMock,
        lessonIdMock,
      );

      expect(studentMarkRepository.find).toHaveBeenCalledWith({
        where: {
          lesson: {
            id: lessonIdMock,
            course: {
              id: courseIdMock,
              instructorCourses: { instructor: { id: instructorIdMock } },
            },
          },
        },
        relations: {
          student: true,
        },
        select: {
          student: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      });
      expect(result).toEqual([lessonMarkDataMock]);
    });

    it('should return an empty array', async () => {
      studentMarkRepository.find.mockResolvedValue([]);

      const result = await instructorsService.getLessonMarks(
        instructorIdMock,
        courseIdMock,
        lessonIdMock,
      );

      expect(studentMarkRepository.find).toHaveBeenCalledWith({
        where: {
          lesson: {
            id: lessonIdMock,
            course: {
              id: courseIdMock,
              instructorCourses: { instructor: { id: instructorIdMock } },
            },
          },
        },
        relations: {
          student: true,
        },
        select: {
          student: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getLessonHomeworks', () => {
    it('should get lesson homeworks', async () => {
      homeworkRepository.find.mockResolvedValue([lessonHomeworkData]);

      const result = await instructorsService.getLessonHomeworks(
        instructorIdMock,
        courseIdMock,
        lessonIdMock,
      );

      expect(homeworkRepository.find).toHaveBeenCalledWith({
        where: {
          lesson: {
            id: lessonIdMock,
            course: {
              id: courseIdMock,
              instructorCourses: { instructor: { id: instructorIdMock } },
            },
          },
        },
        relations: {
          student: true,
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          student: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      });
      expect(result).toEqual([lessonHomeworkData]);
    });
  });

  describe('getStudentsData', () => {
    it('should get students data', async () => {
      const courseWithStudentDataMock = {
        ...studentCourseDataDBMock,
        final_mark: 43,
        is_course_pass: true,
      };

      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      studentCourseRepository.find.mockResolvedValue([
        courseWithStudentDataMock,
      ]);

      const result = await instructorsService.getStudentsData(
        instructorIdMock,
        courseIdMock,
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(studentCourseRepository.find).toHaveBeenCalledWith({
        where: {
          course: { id: courseIdMock },
        },
        relations: {
          student: true,
        },
        select: {
          student: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      });
      expect(result).toEqual([courseWithStudentDataMock]);
    });
  });

  describe('getLessonHomeworkFile', () => {
    const dto = {
      homework_id: homeworkIdMock,
      student_id: studentIdMock,
      lesson_id: lessonIdMock,
      course_id: courseIdMock,
    };

    it('should get a homework file', async () => {
      const homeworkDataMock = {
        id: homeworkIdMock,
        created_at: '2022-07-22T13:34:20.461Z',
        updated_at: '2022-07-22T13:34:20.461Z',
        file_path: 'file_path',
      };

      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      homeworkRepository.findOne.mockResolvedValue(homeworkDataMock);

      const getFileSpy = jest.spyOn(mockedStorageService, 'get');

      await instructorsService.getLessonHomeworkFile(instructorIdMock, dto);

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: dto.course_id },
        },
      });
      expect(homeworkRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.homework_id,
          student: { id: dto.student_id },
          lesson: { id: dto.lesson_id },
        },
      });
      expect(getFileSpy).toHaveBeenCalledWith(homeworkDataMock.file_path);
    });

    it('should throw an error if homework file is not found', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);
      homeworkRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.getLessonHomeworkFile(instructorIdMock, dto),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('putFinalMarksForStudents', () => {
    const finalMarkMock = {
      studentId: studentIdMock,
      final_mark: '59',
    };

    it('should put final mark for students', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);

      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');
      const lessonRepositoryQueryBuilderSpy = jest
        .spyOn(lessonRepository, 'query')
        .mockResolvedValue([finalMarkMock]);
      const studentCourseRepositoryQueryBuilderSpy = jest.spyOn(
        studentCourseRepository,
        'createQueryBuilder',
      );

      await instructorsService.putFinalMarksForStudents(
        instructorIdMock,
        courseIdMock,
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(queryRunnerConnectSpy).toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).toHaveBeenCalled();
      expect(studentCourseRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).toHaveBeenCalled();
    });

    it('should throw an error if marks are not found', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);

      const lessonRepositoryQueryBuilderSpy = jest
        .spyOn(lessonRepository, 'query')
        .mockResolvedValue([]);
      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');
      const studentCourseRepositoryQueryBuilderSpy = jest.spyOn(
        studentCourseRepository,
        'createQueryBuilder',
      );

      await expect(
        instructorsService.putFinalMarksForStudents(
          instructorIdMock,
          courseIdMock,
        ),
      ).rejects.toThrow(
        new HttpException(
          'There are no grades for this course',
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(queryRunnerConnectSpy).not.toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).not.toHaveBeenCalled();
      expect(studentCourseRepositoryQueryBuilderSpy).not.toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).not.toHaveBeenCalled();
    });
  });

  describe('putFinalMarkForStudent', () => {
    const finalMarkMock = {
      studentId: studentIdMock,
      final_mark: '59',
    };
    const dto = {
      student_id: studentIdMock,
      course_id: courseIdMock,
    };

    it('should put final mark for student', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);

      const lessonRepositoryQueryBuilderSpy = jest
        .spyOn(lessonRepository, 'query')
        .mockResolvedValue([finalMarkMock]);
      const studentCourseRepositoryQueryBuilderSpy = jest.spyOn(
        studentCourseRepository,
        'createQueryBuilder',
      );

      await instructorsService.putFinalMarkForStudent(instructorIdMock, dto);

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(studentCourseRepositoryQueryBuilderSpy).toHaveBeenCalled();
    });

    it('should throw an error if a mark is not found', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);

      const lessonRepositoryQueryBuilderSpy = jest
        .spyOn(lessonRepository, 'query')
        .mockResolvedValue([]);

      await expect(
        instructorsService.putFinalMarkForStudent(instructorIdMock, dto),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepositoryQueryBuilderSpy).toHaveBeenCalled();
    });
  });

  describe('putPassCourseForStudent', () => {
    const studentMarkMock = {
      studentId: studentIdMock,
      highest_mark_sum: 60,
      mark_sum: 26,
    };
    const dto = {
      student_id: studentIdMock,
      course_id: courseIdMock,
    };

    it('should put pass a course for student', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);

      const lessonRepositoryQueryBuilderSpy = jest
        .spyOn(lessonRepository, 'query')
        .mockResolvedValue([studentMarkMock]);
      const studentCourseRepositoryQueryBuilderSpy = jest.spyOn(
        studentCourseRepository,
        'createQueryBuilder',
      );

      await instructorsService.putPassCourseForStudent(instructorIdMock, dto);

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(studentCourseRepositoryQueryBuilderSpy).toHaveBeenCalled();
    });

    it('should throw an error if a mark is not found', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);

      const lessonRepositoryQueryBuilderSpy = jest
        .spyOn(lessonRepository, 'query')
        .mockResolvedValue([]);

      await expect(
        instructorsService.putPassCourseForStudent(instructorIdMock, dto),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepositoryQueryBuilderSpy).toHaveBeenCalled();
    });
  });

  describe('putPassCourseForStudents', () => {
    const studentMarkMock = {
      studentId: studentIdMock,
      highest_mark_sum: 60,
      mark_sum: 26,
    };

    it('should put pass a course for students', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);

      const lessonRepositoryQueryBuilderSpy = jest
        .spyOn(lessonRepository, 'query')
        .mockResolvedValue([studentMarkMock]);
      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const studentCourseRepositoryQueryBuilderSpy = jest.spyOn(
        studentCourseRepository,
        'createQueryBuilder',
      );
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');

      await instructorsService.putPassCourseForStudents(
        instructorIdMock,
        courseIdMock,
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(queryRunnerConnectSpy).toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).toHaveBeenCalled();
      expect(studentCourseRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).toHaveBeenCalled();
    });

    it('should throw an error if marks are not found', async () => {
      instructorCourseRepository.findOne.mockResolvedValue(courseDataDBMock);

      const lessonRepositoryQueryBuilderSpy = jest
        .spyOn(lessonRepository, 'query')
        .mockResolvedValue([]);
      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');
      const studentCourseRepositoryQueryBuilderSpy = jest.spyOn(
        studentCourseRepository,
        'createQueryBuilder',
      );

      await expect(
        instructorsService.putPassCourseForStudents(
          instructorIdMock,
          courseIdMock,
        ),
      ).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );

      expect(instructorCourseRepository.findOne).toHaveBeenCalledWith({
        where: {
          instructor: { id: instructorIdMock },
          course: { id: courseIdMock },
        },
      });
      expect(lessonRepositoryQueryBuilderSpy).toHaveBeenCalled();
      expect(queryRunnerConnectSpy).not.toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).not.toHaveBeenCalled();
      expect(studentCourseRepositoryQueryBuilderSpy).not.toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).not.toHaveBeenCalled();
    });
  });
});
