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
import { Repository, DataSource } from 'typeorm';
import {
  EmailTemplates,
  MIN_PERCENTAGE_OF_FINAL_MARK,
  UserRoles,
} from '../../constants';
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
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { PutMarkForStudentDto } from './dto/put-mark-for-student.dto';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';
import { UpdateMarkDto } from './dto/update-mark.dto';
import { lessonMarksExampleDto } from './dto/lesson-marks-example.dto';
import { PutFinalMarkForStudentDto } from './dto/put-final-mark-for-student.dto';
import { courseStudentsDataExampleDto } from './dto/course-students-data-example.dto';

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
    @InjectRepository(StudentMark)
    private readonly studentMarkRepository: Repository<StudentMark>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
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

    return studentCourses.map((item) => item.student);
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

  async getCourseFeedbacks(
    instructorId: string,
    courseId: string,
  ): Promise<CourseFeedback[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor course feedbacks`);

    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: courseId },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    const courseFeedbacks = await this.courseFeedbackRepository.find({
      where: {
        course: { id: courseId },
        instructor: { id: instructorId },
      },
    });

    return courseFeedbacks;
  }

  async updateCourseFeedback(
    instructorId: string,
    courseId: string,
    updateFeedbackDto: UpdateFeedbackDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} update course feedback`);

    const courseFeedback = await this.courseFeedbackRepository.findOne({
      where: {
        course: { id: courseId },
        instructor: { id: instructorId },
        id: updateFeedbackDto.feedback_id,
      },
    });

    if (!courseFeedback) {
      throw new HttpException('Feedback not found', HttpStatus.NOT_FOUND);
    }

    courseFeedback.text = updateFeedbackDto.text;

    await this.courseFeedbackRepository.save(courseFeedback);
  }

  async deleteCourseFeedback(
    instructorId: string,
    courseId: string,
    feedbackId: string,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} delete course feedback`);

    const result = await this.courseFeedbackRepository.delete({
      id: feedbackId,
      instructor: { id: instructorId },
      course: { id: courseId },
    });

    if (!result.affected) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
  }

  async putMarkForStudent(
    instructorId: string,
    putMarkForStudentDto: PutMarkForStudentDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} put a mark for a student`);

    const lesson = await this.lessonRepository.findOne({
      where: {
        id: putMarkForStudentDto.lesson_id,
        course: {
          id: putMarkForStudentDto.course_id,
          instructorCourses: { instructor: { id: instructorId } },
          studentCourses: { student: { id: putMarkForStudentDto.student_id } },
        },
      },
    });

    if (!lesson) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    if (putMarkForStudentDto.mark > lesson.highest_mark) {
      throw new HttpException(
        `The highest mark for this lesson is ${lesson.highest_mark}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const studentMarkData = new StudentMark();
      studentMarkData.mark = putMarkForStudentDto.mark;
      studentMarkData.student = <any>{ id: putMarkForStudentDto.student_id };
      studentMarkData.lesson = <any>{ id: putMarkForStudentDto.lesson_id };

      await this.studentMarkRepository.save(studentMarkData);
    } catch (err) {
      if (err.code === '23505') {
        throw new HttpException(
          'You have already put a mark for this student',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw err;
    }
  }

  async updateStudentMark(instructorId: string, updateMarkDto: UpdateMarkDto) {
    this.logger.log(`${this.LOGGER_PREFIX} put a mark for a student`);

    const studentMark = await this.studentMarkRepository.findOne({
      where: {
        id: updateMarkDto.mark_id,
        lesson: {
          course: { instructorCourses: { instructor: { id: instructorId } } },
        },
      },
    });

    if (!studentMark) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    studentMark.mark = updateMarkDto.mark;

    await this.studentMarkRepository.save(studentMark);
  }

  async getLessonMarks(
    instructorId: string,
    courseId: string,
    lessonId: string,
  ): Promise<typeof lessonMarksExampleDto[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get course lesson marks`);

    const marksData = await this.studentMarkRepository.find({
      where: {
        lesson: {
          id: lessonId,
          course: {
            id: courseId,
            instructorCourses: { instructor: { id: instructorId } },
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

    return marksData;
  }

  async putFinalMarksForStudents(instructorId: string, courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} put final marks for students`);

    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: courseId },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    const studentFinalMarks = await this.lessonRepository.query(
      `
          SELECT sm."studentId", ROUND(AVG(sm.mark)) as final_mark
          FROM lesson
                   INNER JOIN student_mark sm on lesson.id = sm."lessonId"
          WHERE "courseId" = $1
          GROUP BY sm."studentId";
      `,
      [courseId],
    );

    if (!studentFinalMarks.length) {
      throw new HttpException(
        'There are no grades for this course',
        HttpStatus.NOT_FOUND,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const promises = studentFinalMarks.reduce((arr, item) => {
        arr.push(
          this.studentCourseRepository
            .createQueryBuilder('studentMark', queryRunner)
            .update()
            .set({ final_mark: item.final_mark })
            .where('studentId = :id', { id: item.studentId })
            .andWhere('courseId = :courseId', { courseId })
            .execute(),
        );

        return arr;
      }, []);

      await Promise.all(promises);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async putFinalMarkForStudent(
    instructorId: string,
    putFinalMarkForStudentDto: PutFinalMarkForStudentDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} put final mark for student`);

    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: putFinalMarkForStudentDto.course_id },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    const [studentFinalMark] = await this.lessonRepository.query(
      `
          SELECT sm."studentId", ROUND(AVG(sm.mark)) as final_mark
          FROM lesson
                   INNER JOIN student_mark sm on lesson.id = sm."lessonId"
          WHERE "courseId" = $1 AND "studentId" = $2
          GROUP BY sm."studentId";
      `,
      [
        putFinalMarkForStudentDto.course_id,
        putFinalMarkForStudentDto.student_id,
      ],
    );

    if (!studentFinalMark) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    await this.studentCourseRepository
      .createQueryBuilder('studentMark')
      .update()
      .set({ final_mark: studentFinalMark.final_mark })
      .where('studentId = :id', { id: studentFinalMark.studentId })
      .andWhere('courseId = :courseId', {
        courseId: putFinalMarkForStudentDto.course_id,
      })
      .execute();
  }

  async getStudentsData(
    instructorId: string,
    courseId: string,
  ): Promise<typeof courseStudentsDataExampleDto[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get course students data`);

    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: courseId },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.studentCourseRepository.find({
      where: {
        course: { id: courseId },
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

    return result;
  }

  async putPassCourseForStudents(instructorId: string, courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} put pass course for students`);

    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: courseId },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    const studentMarksData = await this.lessonRepository.query(
      `
          SELECT sm."studentId", SUM(l.highest_mark) as highest_mark_sum, SUM(sm.mark) as mark_sum
          FROM lesson as l
                   INNER JOIN student_mark sm on l.id = sm."lessonId"
          WHERE "courseId" = $1
          GROUP BY sm."studentId";
      `,
      [courseId],
    );

    if (!studentMarksData.length) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let isCoursePass;
      const promises = studentMarksData.reduce((arr, item) => {
        isCoursePass =
          (Number(item.mark_sum) * 100) / Number(item.highest_mark_sum) >=
          MIN_PERCENTAGE_OF_FINAL_MARK;

        arr.push(
          this.studentCourseRepository
            .createQueryBuilder('studentMark', queryRunner)
            .update()
            .set({ is_course_pass: isCoursePass })
            .where('studentId = :id', { id: item.studentId })
            .andWhere('courseId = :courseId', { courseId })
            .execute(),
        );

        return arr;
      }, []);

      await Promise.all(promises);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async putPassCourseForStudent(
    instructorId: string,
    putPassCourseForStudentDto: PutFinalMarkForStudentDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} put pass course for a student`);

    const instructorCourse = await this.instructorCourseRepository.findOne({
      where: {
        instructor: { id: instructorId },
        course: { id: putPassCourseForStudentDto.course_id },
      },
    });

    if (!instructorCourse) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    const [studentMarkData] = await this.lessonRepository.query(
      `
          SELECT sm."studentId", SUM(l.highest_mark) as highest_mark_sum, SUM(sm.mark) as mark_sum
          FROM lesson as l
                   INNER JOIN student_mark sm on l.id = sm."lessonId"
          WHERE "courseId" = $1 AND "studentId" = $2
          GROUP BY sm."studentId";
      `,
      [
        putPassCourseForStudentDto.course_id,
        putPassCourseForStudentDto.student_id,
      ],
    );

    if (!studentMarkData) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const isCoursePass =
      (Number(studentMarkData.mark_sum) * 100) /
        Number(studentMarkData.highest_mark_sum) >=
      MIN_PERCENTAGE_OF_FINAL_MARK;

    await this.studentCourseRepository
      .createQueryBuilder('studentMark')
      .update()
      .set({ is_course_pass: isCoursePass })
      .where('studentId = :id', { id: studentMarkData.studentId })
      .andWhere('courseId = :courseId', {
        courseId: putPassCourseForStudentDto.course_id,
      })
      .execute();
  }
}
