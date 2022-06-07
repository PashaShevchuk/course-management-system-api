import { forwardRef, Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../../db/entities/admin/admin.entity';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    forwardRef(() => AuthModule),
    ConfigModule,
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
