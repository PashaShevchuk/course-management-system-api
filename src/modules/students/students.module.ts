import { forwardRef, Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../config/config.module';
import { RedisModule } from '../redis/redis.module';
import { MailModule } from '../mail/mail.module';
import { StudentsController } from './students.controller';
import { Student } from '../../db/entities/student/student.entity';
import { StudentCourse } from '../../db/entities/student-course/student-course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, StudentCourse, Lesson]),
    forwardRef(() => AuthModule),
    ConfigModule,
    RedisModule,
    MailModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
