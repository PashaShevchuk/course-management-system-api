import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminsModule } from '../admins/admins.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      privateKey: process.env.PRIVATE_KEY || 'SECRET',
      signOptions: {
        expiresIn: process.env.AUTH_TOKEN_EXPIRED_TIME || '24h',
      },
    }),
    forwardRef(() => AdminsModule),
  ],
  exports: [AuthService],
})
export class AuthModule {}
