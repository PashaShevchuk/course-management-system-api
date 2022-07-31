import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { Repository } from 'typeorm';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';
import { lessonMarksExampleDto } from '../instructors/dto/lesson-marks-example.dto';

@Injectable()
export class LessonsService {
  private LOGGER_PREFIX = '[LessonsService]:';
  private logger = new Logger();

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(StudentMark)
    private readonly studentMarkRepository: Repository<StudentMark>,
  ) {}

  async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
    this.logger.log(`${this.LOGGER_PREFIX} create lesson`);
    try {
      const lessonData = new Lesson();
      lessonData.title = createLessonDto.title;
      lessonData.description = createLessonDto.description;
      lessonData.highest_mark = createLessonDto.highest_mark;
      lessonData.course = <any>{ id: createLessonDto.course_id };

      const lesson = await this.lessonRepository.save(lessonData);

      return lesson;
    } catch (err) {
      if (err.code === '23503') {
        throw new HttpException('Course not found', HttpStatus.BAD_REQUEST);
      }

      throw err;
    }
  }

  async updateLesson(
    lessonId: string,
    updateLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    this.logger.log(`${this.LOGGER_PREFIX} update lesson`);
    try {
      const lesson = await this.getLessonById(lessonId);

      lesson.title = updateLessonDto.title;
      lesson.description = updateLessonDto.description;
      lesson.highest_mark = updateLessonDto.highest_mark;
      lesson.course = <any>{ id: updateLessonDto.course_id };

      await this.lessonRepository.save(lesson);

      return lesson;
    } catch (err) {
      if (err.code === '23503') {
        throw new HttpException('Course not found', HttpStatus.BAD_REQUEST);
      }

      throw err;
    }
  }

  async getLessonById(id: string): Promise<Lesson> {
    this.logger.log(`${this.LOGGER_PREFIX} get lesson by ID`);

    const lesson = await this.lessonRepository.findOne({ where: { id } });

    if (!lesson) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return lesson;
  }

  async getAllLessons(): Promise<Lesson[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all lessons`);

    const lessons = await this.lessonRepository.find();

    return lessons;
  }

  async deleteLessonById(id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete lesson by ID`);

    const result = await this.lessonRepository.delete(id);

    if (!result.affected) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
  }

  async getLessonMarks(
    lessonId: string,
  ): Promise<typeof lessonMarksExampleDto[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get lesson marks`);

    const marksData = await this.studentMarkRepository.find({
      where: { lesson: { id: lessonId } },
      relations: {
        lesson: true,
        student: true,
      },
    });

    const marks = marksData.length
      ? marksData.map((item) => ({
          id: item.id,
          mark: item.mark,
          created_at: item.created_at,
          updated_at: item.updated_at,
          lesson: {
            id: item.lesson.id,
            title: item.lesson.title,
            highest_mark: item.lesson.highest_mark,
          },
          student: {
            id: item.student.id,
            first_name: item.student.first_name,
            last_name: item.student.last_name,
          },
        }))
      : [];

    return marks;
  }

  async deleteMark(lessonId: string, markId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete mark`);

    const result = await this.studentMarkRepository.delete({
      id: markId,
      lesson: { id: lessonId },
    });

    if (!result.affected) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
  }
}
