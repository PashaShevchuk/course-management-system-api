import { forwardRef, Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../../config/config.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson]),
    forwardRef(() => AuthModule),
    ConfigModule,
    RedisModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
