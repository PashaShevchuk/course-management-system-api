import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../db/entities/course/course.entity';
import { InstructorCourse } from '../../db/entities/instructor-course/instructor-course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { AssignInstructorDto } from './dto/assign-instructor.dto';
import { InstructorsService } from '../instructors/instructors.service';
import { GetCoursesByParamsDto } from './dto/get-courses-by-params.dto';

@Injectable()
export class CoursesService {
  private LOGGER_PREFIX = '[CoursesService]:';
  private logger = new Logger();

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(InstructorCourse)
    private readonly instructorCourseRepository: Repository<InstructorCourse>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly instructorsService: InstructorsService,
  ) {}

  async getCourseById(id: string): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} get course by ID`);

    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return course;
  }

  async getAllCourses(): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all published courses`);

    const courses = await this.courseRepository.find({
      where: { is_published: true },
    });

    return courses;
  }

  async publishCourse(courseId: string): Promise<Course> {
    const course = await this.getCourseById(courseId);

    if (course.is_published) {
      throw new HttpException(
        'The course has already been published',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isCourseHasInstructor = await this.instructorCourseRepository.findOne(
      {
        where: { course: { id: courseId } },
      },
    );

    if (!isCourseHasInstructor) {
      throw new HttpException(
        'You cannot publish a course that does not have instructors',
        HttpStatus.BAD_REQUEST,
      );
    }

    const [lessons, count] = await this.lessonRepository.findAndCount({
      where: { course: { id: courseId } },
    });

    if (!lessons.length || count < 5) {
      throw new HttpException(
        'You cannot publish a course that has less than 5 lessons',
        HttpStatus.BAD_REQUEST,
      );
    }

    course.is_published = true;

    await this.courseRepository.save(course);

    return course;
  }

  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} create course`);

    const courseData = new Course();
    courseData.title = createCourseDto.title;
    courseData.description = createCourseDto.description;
    courseData.is_published = false;

    const course = await this.courseRepository.save(courseData);

    return course;
  }

  async updateCourse(
    courseId: string,
    updateCourseDto: CreateCourseDto,
  ): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} update course`);

    const course = await this.getCourseById(courseId);

    course.title = updateCourseDto.title;
    course.description = updateCourseDto.description;

    await this.courseRepository.save(course);

    return course;
  }

  async assignInstructor(assignInstructorDto: AssignInstructorDto) {
    this.logger.log(`${this.LOGGER_PREFIX} assign instructor for course`);

    try {
      const course = await this.getCourseById(assignInstructorDto.courseId);
      const instructor = await this.instructorsService.getInstructorById(
        assignInstructorDto.instructorId,
      );

      await this.instructorCourseRepository.save({ course, instructor });
    } catch (err) {
      if (err.code === '23505') {
        throw new HttpException(
          'This user is already assigned to this company',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw err;
    }
  }

  async getCoursesByParams(params: GetCoursesByParamsDto): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get courses by params`);

    return await this.courseRepository.find({ where: { ...params } });
  }

  async deleteCourseById(id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete course by ID`);

    const result = await this.courseRepository.delete(id);

    if (!result.affected) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
  }
}
