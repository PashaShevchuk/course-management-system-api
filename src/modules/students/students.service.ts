import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../../config/config.service';
import { MailService } from '../mail/mail.service';
import { Student } from '../../db/entities/student/student.entity';
import { EmailTemplates, UserRoles } from '../../constants';
import { CreateStudentByAdminDto } from './dto/create-student-by-admin.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentCourse } from '../../db/entities/student-course/student-course.entity';
import { Course } from '../../db/entities/course/course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';

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
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
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
  }): Promise<Student | undefined> {
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

    await this.studentRepository.update(id, {
      is_active: statusDto.is_active,
    });
    const student = await this.getStudentById(id);
    await this.authService.declineToken(id);

    if (statusDto.send_email && this.configService.isEmailEnable()) {
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

    return student;
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
  }

  async takeCourse(studentId: string, courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} take a course`);

    try {
      const studentCourses = await this.studentCourseRepository.findAndCount({
        where: { student: { id: studentId } },
      });

      if (studentCourses[1] > 5) {
        throw new HttpException(
          'You cannot attend more than 5 courses at the same time',
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

    const studentCourse = await this.studentCourseRepository.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
    });

    if (!studentCourse) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const lessons = await this.lessonRepository.find({
      where: { course: { id: courseId } },
    });

    return lessons;
  }
}
