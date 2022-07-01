import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const adminIdMock = 'admin-id';

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
});
