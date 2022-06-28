import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminsService } from '../admins/admins.service';
import { StudentsService } from '../students/students.service';
import { InstructorsService } from '../instructors/instructors.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '../../config/config.service';
import { UnauthorizedException } from '@nestjs/common';

const userDataMock = {
  is_active: true,
  hash_password: '$2b$10$qNLLs/z5fikeH3VBTyOwP.ZMRG.Esxc0rP8K1qhCctOT5R6zz4mUS',
};
const decodedTokenMock = {
  id: 'id',
  email: 'email',
  role: 'admin',
  iat: 1656432428209,
  exp: 1656432428209,
};
const tokenMock =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkNDc0YzEzLWRhNTQtNDg5YS05MmQxLWRiMTFiYmI3OWY3MiIsImVtYWlsIjoiZW1haWxAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjU2NDI2ODE1LCJleHAiOjE2NTY0NzAwMTV9.ellOEmjcE_ljIM6sSNCt1Nx-hI2fprqWu0G6BKs3IGA';
const tokenPrivateKeyMock = 'some-key';
const adminIdMock = 'admin-id';
const adminDataMock = {
  id: adminIdMock,
  first_name: 'name',
  last_name: 'name',
  email: 'email',
  is_active: true,
  hash_password: userDataMock.hash_password,
  created_at: '2022-06-17T11:55:43.032Z',
  updated_at: '2022-06-17T11:55:43.032Z',
  role: 'admin',
};
const studentDataMock = {
  ...adminDataMock,
  birth_date: '01.01.2000',
  role: 'student',
};
const instructorDataMock = {
  ...adminDataMock,
  position: 'position',
  role: 'instructor',
};

const mockedAdminsService = {
  getAdminByParams: jest.fn(() => Promise.resolve(adminDataMock)),
};
const mockedStudentsService = {
  getStudentByParams: jest.fn(() => Promise.resolve(studentDataMock)),
};
const mockedInstructorsService = {
  getInstructorByParams: jest.fn(() => Promise.resolve(instructorDataMock)),
};
const mockedJwtService = {
  decode: jest.fn(() => decodedTokenMock),
  verify: jest.fn(() => decodedTokenMock),
  sign: jest.fn(() => tokenMock),
};
const mockedRedisService = {
  del: jest.fn(() => Promise.resolve()),
  set: jest.fn(() => Promise.resolve()),
};
const mockedConfigService = {
  getTokenPrivateKey: jest.fn(() => tokenPrivateKeyMock),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AdminsService,
          useValue: mockedAdminsService,
        },
        {
          provide: StudentsService,
          useValue: mockedStudentsService,
        },
        {
          provide: InstructorsService,
          useValue: mockedInstructorsService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: RedisService,
          useValue: mockedRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    const dto = {
      email: 'email',
      password: '123456789',
    };

    it('should log in user (Admin)', async () => {
      const getAdminByParamsSpy = jest.spyOn(
        mockedAdminsService,
        'getAdminByParams',
      );
      const signSpy = jest.spyOn(mockedJwtService, 'sign');
      const setSpy = jest.spyOn(mockedRedisService, 'set');

      const result = await authService.login(dto);

      expect(getAdminByParamsSpy).toHaveBeenCalledWith({ email: dto.email });
      expect(signSpy).toHaveBeenCalledWith({
        id: adminDataMock.id,
        email: adminDataMock.email,
        role: adminDataMock.role,
      });
      expect(setSpy).toHaveBeenCalledWith(adminDataMock.id, tokenMock);
      expect(result).toEqual({ token: tokenMock });
    });

    it('should log in user (Student)', async () => {
      const getAdminByParamsSpy = jest
        .spyOn(mockedAdminsService, 'getAdminByParams')
        .mockResolvedValue(null);
      const getStudentByParamsSpy = jest.spyOn(
        mockedStudentsService,
        'getStudentByParams',
      );
      const signSpy = jest.spyOn(mockedJwtService, 'sign');
      const setSpy = jest.spyOn(mockedRedisService, 'set');

      const result = await authService.login(dto);

      expect(getAdminByParamsSpy).toHaveBeenCalledWith({ email: dto.email });
      expect(getStudentByParamsSpy).toHaveBeenCalledWith({ email: dto.email });
      expect(signSpy).toHaveBeenCalledWith({
        id: studentDataMock.id,
        email: studentDataMock.email,
        role: studentDataMock.role,
      });
      expect(setSpy).toHaveBeenCalledWith(studentDataMock.id, tokenMock);
      expect(result).toEqual({ token: tokenMock });
    });

    it('should log in user (Instructor)', async () => {
      const getAdminByParamsSpy = jest
        .spyOn(mockedAdminsService, 'getAdminByParams')
        .mockResolvedValue(null);
      const getStudentByParamsSpy = jest
        .spyOn(mockedStudentsService, 'getStudentByParams')
        .mockResolvedValue(null);
      const getInstructorByParamsSpy = jest.spyOn(
        mockedInstructorsService,
        'getInstructorByParams',
      );
      const signSpy = jest.spyOn(mockedJwtService, 'sign');
      const setSpy = jest.spyOn(mockedRedisService, 'set');

      const result = await authService.login(dto);

      expect(getAdminByParamsSpy).toHaveBeenCalledWith({ email: dto.email });
      expect(getStudentByParamsSpy).toHaveBeenCalledWith({ email: dto.email });
      expect(getInstructorByParamsSpy).toHaveBeenCalledWith({
        email: dto.email,
      });
      expect(signSpy).toHaveBeenCalledWith({
        id: instructorDataMock.id,
        email: instructorDataMock.email,
        role: instructorDataMock.role,
      });
      expect(setSpy).toHaveBeenCalledWith(instructorDataMock.id, tokenMock);
      expect(result).toEqual({ token: tokenMock });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const getAdminByParamsSpy = jest
        .spyOn(mockedAdminsService, 'getAdminByParams')
        .mockResolvedValue(null);
      const getStudentByParamsSpy = jest
        .spyOn(mockedStudentsService, 'getStudentByParams')
        .mockResolvedValue(null);
      const getInstructorByParamsSpy = jest
        .spyOn(mockedInstructorsService, 'getInstructorByParams')
        .mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        new UnauthorizedException(),
      );
      expect(getAdminByParamsSpy).toHaveBeenCalledWith({ email: dto.email });
      expect(getStudentByParamsSpy).toHaveBeenCalledWith({ email: dto.email });
      expect(getInstructorByParamsSpy).toHaveBeenCalledWith({
        email: dto.email,
      });
    });
  });

  describe('decodeToken', () => {
    it('should decode token', async () => {
      const decodeSpy = jest.spyOn(mockedJwtService, 'decode');

      const result = await authService.decodeToken(tokenMock);

      expect(decodeSpy).toHaveBeenCalledWith(tokenMock);
      expect(result).toBe(decodedTokenMock);
    });
  });

  describe('verifyToken', () => {
    it('should verify token', async () => {
      const getTokenPrivateKeySpy = jest.spyOn(
        mockedConfigService,
        'getTokenPrivateKey',
      );
      const verifySpy = jest.spyOn(mockedJwtService, 'verify');

      const result = await authService.verifyToken(tokenMock);

      expect(getTokenPrivateKeySpy).toHaveBeenCalled();
      expect(verifySpy).toHaveBeenCalledWith(tokenMock, {
        secret: tokenPrivateKeyMock,
      });
      expect(result).toBe(decodedTokenMock);
    });
  });

  describe('declineToken', () => {
    it('should decode token', async () => {
      const delSpy = jest.spyOn(mockedRedisService, 'del');

      await authService.declineToken(adminIdMock);

      expect(delSpy).toHaveBeenCalledWith(adminIdMock);
    });
  });
});
