import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Readable } from 'stream';
import * as httpMocks from 'node-mocks-http';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { Admin } from '../../db/entities/admin/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { CreateAdminByAdminDto } from './dto/create-admin-by-admin.dto';
import { GetAdminsByStatusDto } from './dto/get-admins--by-status.dto';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Homework } from '../../db/entities/homework/homework.entity';
import { StorageService } from '../storage/storage.service';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

let resMock;

const adminIdMock = 'admin-id';
const homeworkIdMock = 'homework-id';

describe('AdminsController', () => {
  let adminsController: AdminsController;
  let adminsService: AdminsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminsController],
      providers: [
        AdminsService,
        {
          provide: getRepositoryToken(Admin),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Homework),
          useFactory: mockRepository,
        },
        {
          provide: StorageService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: AuthService,
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
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile();

    resMock = httpMocks.createResponse();

    adminsService = module.get(AdminsService);
    adminsController = module.get(AdminsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('registration', () => {
    it('should register user', async () => {
      const result = 'massage-about-registration';
      const dto = new CreateAdminDto();

      jest
        .spyOn(adminsService, 'createAdmin')
        .mockImplementation(() => Promise.resolve(result));

      expect(await adminsController.registration(dto)).toBe(result);
    });
  });

  describe('createByAdmin', () => {
    it('should create admin by admin', async () => {
      const result = new Admin();
      const dto = new CreateAdminByAdminDto();

      jest
        .spyOn(adminsService, 'createAdminByAdmin')
        .mockImplementation(() => Promise.resolve(result));

      expect(await adminsController.createByAdmin(dto)).toBe(result);
    });
  });

  describe('getAdminsByStatus', () => {
    it('should get admins by status', async () => {
      const result = [new Admin()];
      const dto = new GetAdminsByStatusDto();

      jest
        .spyOn(adminsService, 'getAdminsByParams')
        .mockImplementation(() => Promise.resolve(result));

      expect(await adminsController.getAdminsByStatus(dto)).toBe(result);
    });
  });

  describe('updateStatus', () => {
    it('should update admin is_active status', async () => {
      const result = new Admin();
      const dto = new UpdateAdminStatusDto();

      jest
        .spyOn(adminsService, 'updateStatus')
        .mockImplementation(() => Promise.resolve(result));

      expect(await adminsController.updateStatus(adminIdMock, dto)).toBe(
        result,
      );
    });
  });

  describe('update', () => {
    it('should update admin', async () => {
      const result = new Admin();
      const dto = new UpdateAdminDto();
      const reqMock = { user: { id: adminIdMock } };

      jest
        .spyOn(adminsService, 'updateAdmin')
        .mockImplementation(() => Promise.resolve(result));

      expect(await adminsController.update(reqMock, dto)).toBe(result);
    });
  });

  describe('getAll', () => {
    it('should get all admins', async () => {
      const result = [new Admin()];

      jest
        .spyOn(adminsService, 'getAllAdmins')
        .mockImplementation(() => Promise.resolve(result));

      expect(await adminsController.getAll()).toBe(result);
    });
  });

  describe('getOne', () => {
    it('should get admin by ID', async () => {
      const result = new Admin();

      jest
        .spyOn(adminsService, 'getAdminById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await adminsController.getOne(adminIdMock)).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete admin by ID', async () => {
      jest
        .spyOn(adminsService, 'deleteAdminById')
        .mockImplementation(() => Promise.resolve());

      await adminsController.delete(adminIdMock);

      expect(adminsService.deleteAdminById).toBeCalledWith(adminIdMock);
    });
  });

  describe('getHomeworks', () => {
    it('should get homeworks list', async () => {
      const result = [new Homework()];

      jest
        .spyOn(adminsService, 'getHomeworks')
        .mockImplementation(() => Promise.resolve(result));

      expect(await adminsController.getHomeworks()).toBe(result);
    });
  });

  describe('getHomeworkFile', () => {
    it('should get a homework file', async () => {
      const buffer = Buffer.from('file content');
      const mockReadableStream = Readable.from(buffer);
      const fileMock = {
        contentType: 'text/html',
        stream: mockReadableStream,
      };

      jest
        .spyOn(adminsService, 'getHomeworkFile')
        .mockImplementation(() => Promise.resolve(fileMock));

      await adminsController.getHomeworkFile(resMock, homeworkIdMock);

      expect(adminsService.getHomeworkFile).toHaveBeenCalledWith(
        homeworkIdMock,
      );
    });
  });

  describe('deleteHomeworkFile', () => {
    it('should delete a homework file', async () => {
      jest
        .spyOn(adminsService, 'deleteHomeworkFile')
        .mockImplementation(() => Promise.resolve());

      await adminsController.deleteHomeworkFile(homeworkIdMock);

      expect(adminsService.deleteHomeworkFile).toBeCalledWith(homeworkIdMock);
    });
  });
});
