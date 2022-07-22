import { forwardRef, Module } from '@nestjs/common';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../../config/config.module';
import { RedisModule } from '../redis/redis.module';
import { MailModule } from '../mail/mail.module';
import { InstructorCourse } from '../../db/entities/instructor-course/instructor-course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { StudentCourse } from '../../db/entities/student-course/student-course.entity';
import { CourseFeedback } from '../../db/entities/course-feedback/course-feedback.entity';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';
import { Homework } from '../../db/entities/homework/homework.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Instructor,
      InstructorCourse,
      Lesson,
      StudentCourse,
      CourseFeedback,
      StudentMark,
      Homework,
    ]),
    forwardRef(() => AuthModule),
    ConfigModule,
    RedisModule,
    MailModule,
    StorageModule,
  ],
  controllers: [InstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService],
})
export class InstructorsModule {}
