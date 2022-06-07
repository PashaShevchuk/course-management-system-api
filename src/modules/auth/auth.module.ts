import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminsModule } from '../admins/admins.module';
import { InstructorsModule } from '../instructors/instructors.module';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../../config/config.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      privateKey: process.env.PRIVATE_KEY || 'SECRET',
      signOptions: {
        expiresIn: process.env.AUTH_TOKEN_EXPIRED_TIME || '12h',
      },
    }),
    forwardRef(() => AdminsModule),
    forwardRef(() => InstructorsModule),
    RedisModule,
    ConfigModule,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
