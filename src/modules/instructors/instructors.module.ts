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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Instructor,
      InstructorCourse,
      Lesson,
      StudentCourse,
      CourseFeedback,
    ]),
    forwardRef(() => AuthModule),
    ConfigModule,
    RedisModule,
    MailModule,
  ],
  controllers: [InstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService],
})
export class InstructorsModule {}
