import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UploadedFile,
} from '@nestjs/common';
import { Express } from 'express';
import { Multer } from 'multer'; // eslint-disable-line
import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../../config/config.service';
import { MailService } from '../mail/mail.service';
import { Student } from '../../db/entities/student/student.entity';
import { EmailTemplates, MAX_COURSES_NUMBER, UserRoles } from '../../constants';
import { CreateStudentByAdminDto } from './dto/create-student-by-admin.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentCourse } from '../../db/entities/student-course/student-course.entity';
import { Course } from '../../db/entities/course/course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { CourseFeedback } from '../../db/entities/course-feedback/course-feedback.entity';
import { StorageService } from '../storage/storage.service';
import { StorageFile } from '../storage/storage-file';
import { Homework } from '../../db/entities/homework/homework.entity';
import { studentLessonDataExampleDto } from './dto/student-lesson-data-example.dto';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';

@Injectable()
export class StudentsService {
  private LOGGER_PREFIX = '[StudentsService]:';
  private logger = new Logger();

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentCourse)
    private readonly studentCourseRepository: Repository<StudentCourse>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(CourseFeedback)
    private readonly courseFeedbackRepository: Repository<CourseFeedback>,
    @InjectRepository(Homework)
    private readonly homeworkRepository: Repository<Homework>,
    @InjectRepository(StudentMark)
    private readonly studentMarkRepository: Repository<StudentMark>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  async createStudentByAdmin(
    createStudentByAdminDto: CreateStudentByAdminDto,
  ): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} create student by admin`);

    const candidate = await this.getStudentByParams({
      email: createStudentByAdminDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const studentData = new Student();
    studentData.first_name = createStudentByAdminDto.first_name;
    studentData.last_name = createStudentByAdminDto.last_name;
    studentData.email = createStudentByAdminDto.email;
    studentData.is_active = createStudentByAdminDto.is_active;
    studentData.role = UserRoles.STUDENT;

    if (createStudentByAdminDto.birth_date) {
      studentData.birth_date = createStudentByAdminDto.birth_date;
    }

    studentData.hash_password = await this.authService.hashPassword(
      createStudentByAdminDto.password,
    );

    const student = await this.studentRepository.save(studentData);

    return student;
  }

  async getStudentByParams(params: {
    [key: string]: any;
  }): Promise<Student | null> {
    this.logger.log(`${this.LOGGER_PREFIX} get student by params`);

    return await this.studentRepository.findOne({ where: { ...params } });
  }

  async getStudentsByParams(params: {
    [key: string]: any;
  }): Promise<Student[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get students by params`);

    return await this.studentRepository.find({ where: { ...params } });
  }

  async createStudent(createStudentDto: CreateStudentDto): Promise<string> {
    this.logger.log(`${this.LOGGER_PREFIX} create student`);

    const candidate = await this.getStudentByParams({
      email: createStudentDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const studentData = new Student();
    studentData.first_name = createStudentDto.first_name;
    studentData.last_name = createStudentDto.last_name;
    studentData.email = createStudentDto.email;
    studentData.is_active = false;
    studentData.role = UserRoles.STUDENT;

    if (createStudentDto.birth_date) {
      studentData.birth_date = createStudentDto.birth_date;
    }

    studentData.hash_password = await this.authService.hashPassword(
      createStudentDto.password,
    );

    await this.studentRepository.save(studentData);

    return 'The account data have been sent to the administrator for verification. After verification, you will receive an email.';
  }

  async updateStatus(
    id: string,
    statusDto: UpdateStudentStatusDto,
  ): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} update student is_active status`);

    const student = await this.getStudentById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.studentRepository
        .createQueryBuilder('student', queryRunner)
        .update()
        .set({ is_active: statusDto.is_active })
        .where('id = :id', { id })
        .execute();

      if (statusDto.send_email) {
        await this.mailService.sendMail(
          student.email,
          EmailTemplates.CHANGE_STATUS,
          'Account status',
          {
            name: `${student.first_name} ${student.last_name}`,
            status: statusDto.is_active,
          },
        );
      }

      await this.authService.declineToken(id);

      await queryRunner.commitTransaction();

      student.is_active = statusDto.is_active;

      return student;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getStudentById(id: string): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} get student by ID`);

    const student = await this.getStudentByParams({ id });

    if (!student) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return student;
  }

  async updateStudent(
    userId: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} update student`);

    const student = await this.getStudentById(userId);

    student.first_name = updateStudentDto.first_name;
    student.last_name = updateStudentDto.last_name;

    if (updateStudentDto.birth_date) {
      student.birth_date = updateStudentDto.birth_date;
    }

    if (updateStudentDto.password) {
      student.hash_password = await this.authService.hashPassword(
        updateStudentDto.password,
      );
      await this.authService.declineToken(userId);
    }

    await this.studentRepository.save(student);

    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all students`);

    const students = await this.studentRepository.find();

    return students;
  }

  async deleteStudentById(id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete student by ID`);

    const result = await this.studentRepository.delete(id);

    if (!result.affected) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    await this.authService.declineToken(id);
  }

  async takeCourse(studentId: string, courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} take a course`);

    try {
      const studentCourses = await this.studentCourseRepository.findAndCount({
        where: { student: { id: studentId } },
      });

      if (studentCourses[1] > MAX_COURSES_NUMBER) {
        throw new HttpException(
          `You cannot attend more than ${MAX_COURSES_NUMBER} courses at the same time`,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.studentCourseRepository.save({
        student: { id: studentId },
        course: { id: courseId },
      });
    } catch (err) {
      if (err.code === '23505') {
        throw new HttpException(
          'You have already taken this course',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (err.code === '23503') {
        throw new HttpException('Course not found', HttpStatus.BAD_REQUEST);
      }

      throw err;
    }
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get student courses`);

    const studentCourses = await this.studentCourseRepository.find({
      where: { student: { id: studentId } },
      relations: { course: true },
    });

    const courses = studentCourses.map((item) => item.course);

    return courses;
  }

  async getStudentCourseLessons(
    studentId: string,
    courseId: string,
  ): Promise<Lesson[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get student course lessons`);

    const lessons = await this.lessonRepository.find({
      where: {
        course: {
          id: courseId,
          studentCourses: { student: { id: studentId } },
        },
      },
    });

    return lessons;
  }

  async getCourseFeedbacks(
    studentId: string,
    courseId: string,
  ): Promise<CourseFeedback[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get student course feedbacks`);

    const courseFeedbacks = await this.courseFeedbackRepository.find({
      where: {
        student: { id: studentId },
        course: {
          id: courseId,
          studentCourses: { student: { id: studentId } },
        },
      },
    });

    return courseFeedbacks;
  }

  async getLessonData(
    studentId: string,
    courseId: string,
    lessonId: string,
  ): Promise<typeof studentLessonDataExampleDto> {
    this.logger.log(`${this.LOGGER_PREFIX} get student lesson data`);

    const lessonData = await this.lessonRepository.findOne({
      where: {
        id: lessonId,
        course: {
          id: courseId,
          studentCourses: { student: { id: studentId } },
        },
      },
    });

    if (!lessonData) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const homeworkData = await this.homeworkRepository.findOne({
      where: {
        student: { id: studentId },
        lesson: { id: lessonId },
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
      },
    });

    const markData = await this.studentMarkRepository.findOne({
      where: {
        student: { id: studentId },
        lesson: { id: lessonId },
      },
    });

    return {
      ...lessonData,
      homework: homeworkData,
      mark: markData,
    };
  }

  async getStudentCourseData(
    studentId: string,
    courseId: string,
  ): Promise<StudentCourse> {
    const result = await this.studentCourseRepository.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
    });

    if (!result) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  async uploadHomeworkFile(
    studentId: string,
    courseId: string,
    lessonId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} upload a homework file`);

    const studentCourse = await this.studentCourseRepository.findOne({
      where: {
        student: { id: studentId },
        course: {
          id: courseId,
          lessons: { id: lessonId },
        },
      },
    });

    if (!studentCourse) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fileId = v4();
      const filePath = `${studentId}/${fileId}`;
      const homeworkData = new Homework();
      homeworkData.file_path = filePath;
      homeworkData.student = <any>{ id: studentId };
      homeworkData.lesson = <any>{ id: lessonId };

      await queryRunner.manager.save(Homework, homeworkData);
      await this.storageService.save(filePath, file.mimetype, file.buffer, [
        { fileId },
      ]);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err.code === '23505') {
        throw new HttpException(
          'You have already uploaded the homework for this lesson',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getHomeworkFile(
    studentId: string,
    homeworkId: string,
  ): Promise<StorageFile> {
    this.logger.log(`${this.LOGGER_PREFIX} get a homework file`);

    const homework = await this.homeworkRepository.findOne({
      where: {
        id: homeworkId,
        student: { id: studentId },
      },
    });

    if (!homework) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return this.storageService.get(homework.file_path);
  }
}
