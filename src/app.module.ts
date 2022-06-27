import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { InstructorsModule } from './modules/instructors/instructors.module';
import { RedisModule } from './modules/redis/redis.module';
import { MailModule } from './modules/mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { StudentsModule } from './modules/students/students.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.getTypeOrmConfig();
      },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.getMailConfig();
      },
    }),
    AdminsModule,
    AuthModule,
    InstructorsModule,
    RedisModule,
    MailModule,
    StudentsModule,
    CoursesModule,
    LessonsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
