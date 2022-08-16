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
const mockedMailService = {
  sendMail: jest.fn(() => Promise.resolve()),
};
const mockedStorageService = {
  get: jest.fn(() => Promise.resolve()),
  save: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
};
const mockedQueryRunnerManager = {
  save: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
};
const mockedQueryRunner = {
  connect: jest.fn(() => Promise.resolve()),
  startTransaction: jest.fn(() => Promise.resolve()),
  commitTransaction: jest.fn(() => Promise.resolve()),
  rollbackTransaction: jest.fn(() => Promise.resolve()),
  release: jest.fn(() => Promise.resolve()),
  manager: mockedQueryRunnerManager,
};

const idMock = 'id';
const adminIdMock = 'admin-id';
const studentIdMock = 'student-id';
const lessonIdMock = 'lesson-id';
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
  let homeworkRepository;

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
          useValue: mockedStorageService,
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: () => mockedQueryRunner },
        },
        {
          provide: AuthService,
          useValue: mockedAuthService,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: mockedMailService,
        },
      ],
    }).compile();

    adminService = module.get(AdminsService);
    adminRepository = module.get(getRepositoryToken(Admin));
    homeworkRepository = module.get(getRepositoryToken(Homework));
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

      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');

      await adminService.deleteAdminById(adminIdMock);

      expect(adminRepository.delete).toHaveBeenCalledWith(adminIdMock);
      expect(declineTokenSpy).toHaveBeenCalledWith(adminIdMock);
    });

    it('should throw an error', async () => {
      adminRepository.delete.mockResolvedValue({ raw: [], affected: 0 });

      await expect(adminService.deleteAdminById(adminIdMock)).rejects.toThrow(
        notFoundError,
      );
    });
  });

  describe('getHomeworks', () => {
    it('should get homeworks data', async () => {
      const homeworkDataMock = {
        id: idMock,
        created_at: '2022-07-22T13:34:20.461Z',
        updated_at: '2022-07-22T13:34:20.461Z',
        student: {
          id: studentIdMock,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@email.com',
        },
        lesson: {
          id: lessonIdMock,
          title: 'Data types',
        },
      };

      homeworkRepository.find.mockResolvedValue([homeworkDataMock]);

      const result = await adminService.getHomeworks();

      expect(homeworkRepository.find).toHaveBeenCalled();
      expect(result).toEqual([homeworkDataMock]);
    });
  });

  describe('getHomeworkFile', () => {
    it('should get a homework file', async () => {
      const homeworkDataMock = {
        id: idMock,
        created_at: '2022-07-22T13:34:20.461Z',
        updated_at: '2022-07-22T13:34:20.461Z',
        file_path: 'file_path',
      };

      homeworkRepository.findOne.mockResolvedValue(homeworkDataMock);

      const getFileSpy = jest.spyOn(mockedStorageService, 'get');

      await adminService.getHomeworkFile(idMock);

      expect(homeworkRepository.findOne).toHaveBeenCalledWith({
        where: { id: idMock },
      });
      expect(getFileSpy).toHaveBeenCalledWith(homeworkDataMock.file_path);
    });

    it('should throw an error if homework file is not found', async () => {
      homeworkRepository.findOne.mockResolvedValue(null);

      await expect(adminService.getHomeworkFile(idMock)).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('deleteHomeworkFile', () => {
    it('should delete a homework file', async () => {
      const homeworkDataMock = {
        id: idMock,
        created_at: '2022-07-22T13:34:20.461Z',
        updated_at: '2022-07-22T13:34:20.461Z',
        file_path: 'file_path',
      };

      homeworkRepository.findOne.mockResolvedValue(homeworkDataMock);

      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerManagerDeleteSpy = jest.spyOn(
        mockedQueryRunnerManager,
        'delete',
      );
      const deleteFileSpy = jest.spyOn(mockedStorageService, 'delete');
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');

      await adminService.deleteHomeworkFile(idMock);

      expect(homeworkRepository.findOne).toHaveBeenCalledWith({
        where: { id: idMock },
      });
      expect(queryRunnerConnectSpy).toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).toHaveBeenCalled();
      expect(queryRunnerManagerDeleteSpy).toHaveBeenCalled();
      expect(deleteFileSpy).toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).toHaveBeenCalled();
    });

    it('should throw an error if data is not found', async () => {
      homeworkRepository.findOne.mockResolvedValue(null);

      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerManagerDeleteSpy = jest.spyOn(
        mockedQueryRunnerManager,
        'delete',
      );
      const deleteFileSpy = jest.spyOn(mockedStorageService, 'delete');
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');

      await expect(adminService.deleteHomeworkFile(idMock)).rejects.toThrow(
        new HttpException('Data not found', HttpStatus.NOT_FOUND),
      );

      expect(homeworkRepository.findOne).toHaveBeenCalledWith({
        where: { id: idMock },
      });
      expect(queryRunnerConnectSpy).not.toHaveBeenCalled();
      expect(queryRunnerStartTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerManagerDeleteSpy).not.toHaveBeenCalled();
      expect(deleteFileSpy).not.toHaveBeenCalled();
      expect(queryRunnerCommitTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerRollbackTransactionSpy).not.toHaveBeenCalled();
      expect(queryRunnerReleaseSpy).not.toHaveBeenCalled();
    });

    it('should throw an error when deleting a homework file', async () => {
      const homeworkDataMock = {
        id: idMock,
        created_at: '2022-07-22T13:34:20.461Z',
        updated_at: '2022-07-22T13:34:20.461Z',
        file_path: 'file_path',
      };

      homeworkRepository.findOne.mockResolvedValue(homeworkDataMock);

      const queryRunnerConnectSpy = jest.spyOn(mockedQueryRunner, 'connect');
      const queryRunnerStartTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'startTransaction',
      );
      const queryRunnerManagerDeleteSpy = jest.spyOn(
        mockedQueryRunnerManager,
        'delete',
      );
      const deleteFileSpy = jest
        .spyOn(mockedStorageService, 'delete')
        .mockRejectedValue('error');
      const queryRunnerCommitTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'commitTransaction',
      );
      const queryRunnerRollbackTransactionSpy = jest.spyOn(
        mockedQueryRunner,
        'rollbackTransaction',
      );
      const queryRunnerReleaseSpy = jest.spyOn(mockedQueryRunner, 'release');

      try {
        await adminService.deleteHomeworkFile(idMock);
      } catch (err) {
        expect(homeworkRepository.findOne).toHaveBeenCalledWith({
          where: { id: idMock },
        });
        expect(queryRunnerConnectSpy).toHaveBeenCalled();
        expect(queryRunnerStartTransactionSpy).toHaveBeenCalled();
        expect(queryRunnerManagerDeleteSpy).toHaveBeenCalled();
        expect(deleteFileSpy).toHaveBeenCalled();
        expect(queryRunnerCommitTransactionSpy).not.toHaveBeenCalled();
        expect(queryRunnerRollbackTransactionSpy).toHaveBeenCalled();
        expect(queryRunnerReleaseSpy).toHaveBeenCalled();
      }
    });
  });
});
