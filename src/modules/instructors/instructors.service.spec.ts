import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../../config/config.service';
import { MailService } from '../mail/mail.service';
import { InstructorsService } from './instructors.service';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { EmailTemplates, UserRoles } from '../../constants';
import { HttpException, HttpStatus } from '@nestjs/common';

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
const instructorIdMock = 'instructor-id';
const hashMock = 'hash';
const createInstructorDataMock = {
  first_name: 'New Admin',
  last_name: 'New Admin',
  email: 'email',
  password: '123456789',
  position: 'Middle',
};
const createInstructorByAdminDataMock = {
  ...createInstructorDataMock,
  is_active: true,
};
const instructorDataMock = {
  id: instructorIdMock,
  first_name: createInstructorDataMock.first_name,
  last_name: createInstructorDataMock.last_name,
  email: createInstructorDataMock.email,
  is_active: createInstructorByAdminDataMock.is_active,
  hash_password: hashMock,
  created_at: '2022-06-17T11:55:43.032Z',
  updated_at: '2022-06-17T11:55:43.032Z',
  role: UserRoles.INSTRUCTOR,
};
const messageAboutCreatingUser =
  'The account data have been sent to the administrator for verification. After verification, you will receive an email.';
const userExistError = new HttpException(
  'A user with this email already exists',
  HttpStatus.BAD_REQUEST,
);
const notFoundError = new HttpException('Data not found', HttpStatus.NOT_FOUND);

describe('InstructorsService', () => {
  let instructorsService: InstructorsService;
  let instructorRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorsService,
        {
          provide: getRepositoryToken(Instructor),
          useFactory: mockRepository,
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

    instructorsService = module.get(InstructorsService);
    instructorRepository = module.get(getRepositoryToken(Instructor));
  });

  afterEach(() => jest.clearAllMocks());

  describe('createInstructorByAdmin', () => {
    it('should create an instructor by admin', async () => {
      instructorRepository.findOne.mockResolvedValue(null);
      instructorRepository.save.mockResolvedValue(instructorDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const result = await instructorsService.createInstructorByAdmin(
        createInstructorByAdminDataMock,
      );

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { email: createInstructorByAdminDataMock.email },
      });
      expect(instructorRepository.save).toHaveBeenCalled();
      expect(hashPasswordSpy).toHaveBeenCalledWith(
        createInstructorByAdminDataMock.password,
      );
      expect(result).toBe(instructorDataMock);
    });

    it('should throw an error', async () => {
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      await expect(
        instructorsService.createInstructorByAdmin(
          createInstructorByAdminDataMock,
        ),
      ).rejects.toThrow(userExistError);
    });
  });

  describe('getInstructorByParams', () => {
    it('should get instructor by params', async () => {
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      const result = await instructorsService.getInstructorByParams({
        email: createInstructorDataMock.email,
      });

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { email: createInstructorDataMock.email },
      });
      expect(result).toEqual(instructorDataMock);
    });
  });

  describe('getInstructorsByParams', () => {
    it('should get instructors by params', async () => {
      instructorRepository.find.mockResolvedValue([instructorDataMock]);

      const result = await instructorsService.getInstructorsByParams({
        email: createInstructorDataMock.email,
      });

      expect(instructorRepository.find).toHaveBeenCalledWith({
        where: { email: createInstructorDataMock.email },
      });
      expect(result).toEqual([instructorDataMock]);
    });
  });

  describe('createInstructor', () => {
    it('should create an instructor', async () => {
      instructorRepository.findOne.mockResolvedValue(null);
      instructorRepository.save.mockResolvedValue(instructorDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const result = await instructorsService.createInstructor(
        createInstructorDataMock,
      );

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { email: createInstructorDataMock.email },
      });
      expect(instructorRepository.save).toHaveBeenCalled();
      expect(hashPasswordSpy).toHaveBeenCalledWith(
        createInstructorDataMock.password,
      );
      expect(result).toBe(messageAboutCreatingUser);
    });

    it('should throw an error', async () => {
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      await expect(
        instructorsService.createInstructor(createInstructorDataMock),
      ).rejects.toThrow(userExistError);
    });
  });

  describe('getInstructorById', () => {
    it('should get instructor by id', async () => {
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      const result = await instructorsService.getInstructorById(
        instructorIdMock,
      );

      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { id: instructorIdMock },
      });
      expect(result).toEqual(instructorDataMock);
    });

    it('should throw an error', async () => {
      instructorRepository.findOne.mockResolvedValue(null);

      await expect(
        instructorsService.getInstructorById(instructorIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('updateStatus', () => {
    it('should update instructor is_active status', async () => {
      const updateStatusData = {
        is_active: true,
        send_email: true,
      };

      instructorRepository.update.mockResolvedValue({
        generatedMaps: [],
        raw: [],
        affected: 1,
      });
      instructorRepository.findOne.mockResolvedValue(instructorDataMock);

      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');
      const isEmailEnableSpy = jest.spyOn(mockedConfigService, 'isEmailEnable');
      const sendMailSpy = jest.spyOn(mockedMailService, 'sendMail');

      const result = await instructorsService.updateStatus(
        instructorIdMock,
        updateStatusData,
      );

      expect(instructorRepository.update).toHaveBeenCalledWith(
        instructorIdMock,
        {
          is_active: updateStatusData.is_active,
        },
      );
      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { id: instructorIdMock },
      });
      expect(declineTokenSpy).toHaveBeenCalledWith(instructorIdMock);
      expect(isEmailEnableSpy).toHaveBeenCalled();
      expect(sendMailSpy).toHaveBeenCalledWith(
        instructorDataMock.email,
        EmailTemplates.CHANGE_STATUS,
        'Account status',
        {
          name: `${instructorDataMock.first_name} ${instructorDataMock.last_name}`,
          status: updateStatusData.is_active,
        },
      );
      expect(result).toBe(instructorDataMock);
    });
  });

  describe('updateInstructor', () => {
    it('should update instructor', async () => {
      const updateData = {
        first_name: 'Name',
        last_name: 'Name',
        password: 'password',
        position: 'position',
      };

      instructorRepository.findOne.mockResolvedValue(instructorDataMock);
      instructorRepository.save.mockResolvedValue(instructorDataMock);

      const hashPasswordSpy = jest.spyOn(mockedAuthService, 'hashPassword');
      const declineTokenSpy = jest.spyOn(mockedAuthService, 'declineToken');

      const result = await instructorsService.updateInstructor(
        instructorIdMock,
        updateData,
      );

      expect(instructorRepository.save).toHaveBeenCalled();
      expect(instructorRepository.findOne).toHaveBeenCalledWith({
        where: { id: instructorIdMock },
      });
      expect(hashPasswordSpy).toHaveBeenCalledWith(updateData.password);
      expect(declineTokenSpy).toHaveBeenCalledWith(instructorIdMock);
      expect(result).toBe(instructorDataMock);
    });
  });

  describe('getAllInstructors', () => {
    it('should get all instructors', async () => {
      instructorRepository.find.mockResolvedValue([instructorDataMock]);

      const result = await instructorsService.getAllInstructors();

      expect(instructorRepository.find).toHaveBeenCalled();
      expect(result).toEqual([instructorDataMock]);
    });
  });

  describe('deleteInstructorById', () => {
    it('should delete instructor by id', async () => {
      instructorRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

      await instructorsService.deleteInstructorById(instructorIdMock);

      expect(instructorRepository.delete).toHaveBeenCalledWith(
        instructorIdMock,
      );
    });

    it('should throw an error', async () => {
      instructorRepository.delete.mockResolvedValue({ raw: [], affected: 0 });

      await expect(
        instructorsService.deleteInstructorById(instructorIdMock),
      ).rejects.toThrow(notFoundError);
    });
  });
});
