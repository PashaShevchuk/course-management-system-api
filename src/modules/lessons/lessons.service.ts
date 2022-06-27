import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LessonsService {
  private LOGGER_PREFIX = '[LessonsService]:';
  private logger = new Logger();

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
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
}
