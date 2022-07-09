import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserResponseDto } from './dto/login-user-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../redis/redis.service';
import { StudentsService } from '../students/students.service';
import { JwtService } from '@nestjs/jwt';
import { InstructorsService } from '../instructors/instructors.service';
import { AdminsService } from '../admins/admins.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AdminsService,
          useValue: {},
        },
        {
          provide: InstructorsService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: RedisService,
          useValue: {},
        },
        {
          provide: StudentsService,
          useValue: {},
        },
      ],
    }).compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('should log in user', async () => {
      const result = new LoginUserResponseDto();
      const dto = new LoginUserDto();

      jest
        .spyOn(authService, 'login')
        .mockImplementation(() => Promise.resolve(result));

      expect(await authController.login(dto)).toBe(result);
    });
  });

  describe('declineToken', () => {
    it('should decline token', async () => {
      const userIdMock = 'user-id';
      const reqMock = { user: { id: userIdMock } };

      jest
        .spyOn(authService, 'declineToken')
        .mockImplementation(() => Promise.resolve());

      await authController.declineToken(reqMock);

      expect(authService.declineToken).toHaveBeenCalledWith(userIdMock);
    });
  });
});
