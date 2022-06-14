import { forwardRef, Module } from '@nestjs/common';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../../config/config.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Instructor]),
    ConfigModule,
    RedisModule,
  ],
  controllers: [InstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService],
})
export class InstructorsModule {}
