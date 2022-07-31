import { HttpException, HttpStatus } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Admin } from '../../db/entities/admin/admin.entity';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '../../config/config.service';
import { EmailTemplates } from '../../constants';
import { Homework } from '../../db/entities/homework/homework.entity';
import { StorageService } from '../storage/storage.service';
import { DataSource } from 'typeorm';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});
const mockedAuthService = {
  hashPassword: jest.fn(() => Promise.resolve(hashMock)),
  declineToken: jest.fn(() => Promise.resolve()),
};
const mockedConfigService = {
  isEmailEnable: jest.fn(() => true),
};
const mockedMailService = {
  sendMail: jest.fn(() => Promise.resolve()),
};
const adminIdMock = 'admin-id';
const hashMock = 'hash';
const createAdminDataMock = {
  first_name: 'New Admin',
  last_name: 'New Admin',
  email: 'email',
  password: '123456789',
};
const createAdminByAdminDataMock = {
  ...createAdminDataMock,
  is_active: true,
};
const adminDataMock = {
  id: adminIdMock,
  first_name: createAdminDataMock.first_name,
  last_name: createAdminDataMock.last_name,
  email: createAdminDataMock.email,
  is_active: createAdminByAdminDataMock.is_active,
  hash_password: hashMock,
  created_at: '2022-06-17T11:55:43.032Z',
  updated_at: '2022-06-17T11:55:43.032Z',
  role: 'admin',
};
const messageAboutCreatingAdmin =
  'The account data have been sent to the administrator for verification. After verification, you will receive an email.';
const userExistError = new HttpException(
  'A user with this email already exists',
  HttpStatus.BAD_REQUEST,
);
const notFoundError = new HttpException('Data not found', HttpStatus.NOT_FOUND);

describe('AdminsService', () => {
  let adminService: AdminsService;
  let adminRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          useValue: mockedAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: MailService,
          useValue: mockedMailService,
        },
      ],
    }).compile();

    adminService = module.get(AdminsService);
    adminRepository = module.get(getRepositoryToken(Admin));
  });

  afterEach(() => jest.clearAllMocks());

  describe('createAdmin', () => {
    it('should create admin', async () => {
      adminRepository.findOne.mockResolvedValue(null);
      adminRepository.save.mockResolvedValue(adminDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const result = await adminService.createAdmin(createAdminDataMock);

      expect(adminRepository.findOne).toHaveBeenCalledWith({
        where: { email: createAdminDataMock.email },
      });
      expect(adminRepository.save).toHaveBeenCalled();
      expect(hashPasswordSpy).toHaveBeenCalledWith(
        createAdminDataMock.password,
      );
      expect(result).toBe(messageAboutCreatingAdmin);
    });

    it('should throw an error', async () => {
      adminRepository.findOne.mockResolvedValue(adminDataMock);

      await expect(
        adminService.createAdmin(createAdminDataMock),
      ).rejects.toThrow(userExistError);
    });
  });

  describe('createAdminByAdmin', () => {
    it('should create admin by admin', async () => {
      adminRepository.findOne.mockResolvedValue(null);
      adminRepository.save.mockResolvedValue(adminDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const result = await adminService.createAdminByAdmin(
        createAdminByAdminDataMock,
      );

      expect(adminRepository.findOne).toHaveBeenCalledWith({
        where: { email: createAdminByAdminDataMock.email },
      });
      expect(adminRepository.save).toHaveBeenCalled();
      expect(hashPasswordSpy).toHaveBeenCalledWith(
        createAdminByAdminDataMock.password,
      );
      expect(result).toEqual(adminDataMock);
    });

    it('should throw an error', async () => {
      adminRepository.findOne.mockResolvedValue(adminDataMock);

      await expect(
        adminService.createAdminByAdmin(createAdminByAdminDataMock),
      ).rejects.toThrow(userExistError);
    });
  });

  describe('getAdminByParams', () => {
    it('should get admin by params', async () => {
      adminRepository.findOne.mockResolvedValue(adminDataMock);

      const result = await adminService.getAdminByParams({
        email: createAdminDataMock.email,
      });

      expect(adminRepository.findOne).toHaveBeenCalledWith({
        where: { email: createAdminDataMock.email },
      });
      expect(result).toEqual(adminDataMock);
    });
  });

  describe('getAdminsByParams', () => {
    it('should get admins by params', async () => {
      adminRepository.find.mockResolvedValue([adminDataMock]);

      const result = await adminService.getAdminsByParams({
        email: createAdminDataMock.email,
      });

      expect(adminRepository.find).toHaveBeenCalledWith({
        where: { email: createAdminDataMock.email },
      });
      expect(result).toEqual([adminDataMock]);
    });
  });

  describe('getAllAdmins', () => {
    it('should get all admins', async () => {
      adminRepository.find.mockResolvedValue([adminDataMock]);

      const result = await adminService.getAllAdmins();

      expect(adminRepository.find).toHaveBeenCalled();
      expect(result).toEqual([adminDataMock]);
    });
  });

  describe('getAdminById', () => {
    it('should get admin by id', async () => {
      adminRepository.findOne.mockResolvedValue(adminDataMock);

      const result = await adminService.getAdminById(adminIdMock);

      expect(adminRepository.findOne).toHaveBeenCalledWith({
        where: { id: adminIdMock },
      });
      expect(result).toEqual(adminDataMock);
    });

    it('should throw an error', async () => {
      adminRepository.findOne.mockResolvedValue(null);

      await expect(adminService.getAdminById(adminIdMock)).rejects.toThrow(
        notFoundError,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update admin is_active status', async () => {
      const updateStatusData = {
        is_active: true,
        send_email: true,
      };

      adminRepository.update.mockResolvedValue({
        generatedMaps: [],
        raw: [],
        affected: 1,
      });
      adminRepository.findOne.mockResolvedValue(adminDataMock);

      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');
      const isEmailEnableSpy = jest.spyOn(mockedConfigService, 'isEmailEnable');
      const sendMailSpy = jest.spyOn(mockedMailService, 'sendMail');

      const result = await adminService.updateStatus(
        adminIdMock,
        updateStatusData,
      );

      expect(adminRepository.update).toHaveBeenCalledWith(adminIdMock, {
        is_active: updateStatusData.is_active,
      });
      expect(adminRepository.findOne).toHaveBeenCalledWith({
        where: { id: adminIdMock },
      });
      expect(declineTokenSpy).toHaveBeenCalledWith(adminIdMock);
      expect(isEmailEnableSpy).toHaveBeenCalled();
      expect(sendMailSpy).toHaveBeenCalledWith(
        adminDataMock.email,
        EmailTemplates.CHANGE_STATUS,
        'Account status',
        {
          name: `${adminDataMock.first_name} ${adminDataMock.last_name}`,
          status: updateStatusData.is_active,
        },
      );
      expect(result).toBe(adminDataMock);
    });
  });

  describe('updateAdmin', () => {
    it('should update admin', async () => {
      const updateAdminData = {
        first_name: 'Name',
        last_name: 'Name',
        password: 'password',
      };

      adminRepository.findOne.mockResolvedValue(adminDataMock);
      adminRepository.save.mockResolvedValue(adminDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');

      const result = await adminService.updateAdmin(
        adminIdMock,
        updateAdminData,
      );

      expect(adminRepository.save).toHaveBeenCalled();
      expect(adminRepository.findOne).toHaveBeenCalledWith({
        where: { id: adminIdMock },
      });
      expect(hashPasswordSpy).toHaveBeenCalledWith(updateAdminData.password);
      expect(declineTokenSpy).toHaveBeenCalledWith(adminIdMock);
      expect(result).toBe(adminDataMock);
    });
  });

  describe('deleteAdminById', () => {
    it('should delete admin by id', async () => {
      adminRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

      await adminService.deleteAdminById(adminIdMock);

      expect(adminRepository.delete).toHaveBeenCalledWith(adminIdMock);
    });

    it('should throw an error', async () => {
      adminRepository.delete.mockResolvedValue({ raw: [], affected: 0 });

      await expect(adminService.deleteAdminById(adminIdMock)).rejects.toThrow(
        notFoundError,
      );
    });
  });
});
