import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateInstructorByAdminDto } from './dto/create-instructor-by-admin.dto';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplates, UserRoles } from '../../constants';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorStatusDto } from './dto/update-instructor-status.dto';
import { ConfigService } from '../../config/config.service';
import { MailService } from '../mail/mail.service';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { Course } from '../../db/entities/course/course.entity';
import { InstructorCourse } from '../../db/entities/instructor-course/instructor-course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { StudentCourse } from '../../db/entities/student-course/student-course.entity';
import { Student } from '../../db/entities/student/student.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { CourseFeedback } from '../../db/entities/course-feedback/course-feedback.entity';

@Injectable()
export class InstructorsService {
  private LOGGER_PREFIX = '[InstructorsService]:';
  private logger = new Logger();

  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(InstructorCourse)
    private readonly instructorCourseRepository: Repository<InstructorCourse>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(StudentCourse)
    private readonly studentCourseRepository: Repository<StudentCourse>,
    @InjectRepository(CourseFeedback)
    private readonly courseFeedbackRepository: Repository<CourseFeedback>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async createInstructorByAdmin(
    createInstructorDto: CreateInstructorByAdminDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} create instructor by admin`);

    const candidate = await this.getInstructorByParams({
      email: createInstructorDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const instructorData = new Instructor();
    instructorData.first_name = createInstructorDto.first_name;
    instructorData.last_name = createInstructorDto.last_name;
    instructorData.email = createInstructorDto.email;
    instructorData.position = createInstructorDto.position;
    instructorData.hash_password = await this.authService.hashPassword(
      createInstructorDto.password,
    );
    instructorData.is_active = createInstructorDto.is_active;
    instructorData.role = UserRoles.INSTRUCTOR;

    const instructor = await this.instructorRepository.save(instructorData);

    return instructor;
  }

  async getInstructorByParams(params: {
    [key: string]: any;
  }): Promise<Instructor | undefined> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by params`);

    return await this.instructorRepository.findOne({ where: { ...params } });
  }

  async getInstructorsByParams(params: {
    [key: string]: any;
  }): Promise<Instructor[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructors by params`);

    return await this.instructorRepository.find({ where: { ...params } });
  }

  async createInstructor(
    createInstructorDto: CreateInstructorDto,
  ): Promise<string> {
    this.logger.log(`${this.LOGGER_PREFIX} create instructor`);

    const candidate = await this.getInstructorByParams({
      email: createInstructorDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const instructorData = new Instructor();
    instructorData.first_name = createInstructorDto.first_name;
    instructorData.last_name = createInstructorDto.last_name;
    instructorData.email = createInstructorDto.email;
    instructorData.position = createInstructorDto.position;
    instructorData.hash_password = await this.authService.hashPassword(
      createInstructorDto.password,
    );
    instructorData.is_active = false;
    instructorData.role = UserRoles.INSTRUCTOR;

    await this.instructorRepository.save(instructorData);

    return 'The account data have been sent to the administrator for verification. After verification, you will receive an email.';
  }

  async getInstructorById(id: string): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by ID`);

    const instructor = await this.getInstructorByParams({ id });

    if (!instructor) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return instructor;
  }

  async updateStatus(
    id: string,
    statusDto: UpdateInstructorStatusDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} update instructor is_active status`);

    await this.instructorRepository.update(id, {
      is_active: statusDto.is_active,
    });
    const instructor = await this.getInstructorById(id);
    await this.authService.declineToken(id);

    if (statusDto.send_email && this.configService.isEmailEnable()) {
      await this.mailService.sendMail(
        instructor.email,
        EmailTemplates.CHANGE_STATUS,
        'Account status',
        {
          name: `${instructor.first_name} ${instructor.last_name}`,
          status: statusDto.is_active,
        },
      );
    }

    return instructor;
  }

  async updateInstructor(
    userId: string,
    updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} update instructor`);

    const instructor = await this.getInstructorById(userId);

    instructor.first_name = updateInstructorDto.first_name;
    instructor.last_name = updateInstructorDto.last_name;
    instructor.position = updateInstructorDto.position;

    if (updateInstructorDto.password) {
      instructor.hash_password = await this.authService.hashPassword(
        updateInstructorDto.password,
      );
      await this.authService.declineToken(userId);
    }

    await this.instructorRepository.save(instructor);

    return instructor;
  }

  async getAllInstructors(): Promise<Instructor[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all instructors`);

    const instructors = await this.instructorRepository.find();

    return instructors;
  }

  async deleteInstructorById(id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete instructor by ID`);

    const result = await this.instructorRepository.delete(id);

    if (!result.affected) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
  }

  async getInstructorCourses(instructorId: string): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor courses`);

    const instructorCourses = await this.instructorCourseRepository.find({
      where: { instructor: { id: instructorId } },
      relations: { course: true },
    });

    const courses = instructorCourses.map((item) => item.course);

    return courses;
  }

  async getInstructorCourseLessons(instructorId: string, courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor course lessons`);

    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: courseId },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const lessons = await this.lessonRepository.find({
      where: { course: { id: courseId } },
    });

    return lessons;
  }

  async getInstructorCourseStudents(
    instructorId: string,
    courseId: string,
  ): Promise<Student[]> {
    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: courseId },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const studentCourses = await this.studentCourseRepository.find({
      where: { course: { id: courseId } },
      relations: { student: true },
    });

    const students = studentCourses.reduce((arr, item) => {
      if (item.student.is_active) {
        arr.push(item.student);
      }

      return arr;
    }, []);

    return students;
  }

  async createCourseFeedback(
    instructorId: string,
    courseId: string,
    createFeedbackDto: CreateFeedbackDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} create course feedback`);

    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: courseId },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    const studentCourse = await this.studentCourseRepository.findOne({
      where: {
        course: { id: courseId },
        student: { id: createFeedbackDto.student_id },
      },
    });

    if (!studentCourse) {
      throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
    }

    const feedbackData = new CourseFeedback();
    feedbackData.text = createFeedbackDto.text;
    feedbackData.student = <any>{ id: createFeedbackDto.student_id };
    feedbackData.instructor = <any>{ id: instructorId };
    feedbackData.course = <any>{ id: courseId };

    try {
      await this.courseFeedbackRepository.save(feedbackData);
    } catch (err) {
      if (err.code === '23505') {
        throw new HttpException(
          'You have already left feedback for this student',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw err;
    }
  }
}
