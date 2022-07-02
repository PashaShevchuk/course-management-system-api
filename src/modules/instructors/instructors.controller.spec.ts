import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { CreateInstructorByAdminDto } from './dto/create-instructor-by-admin.dto';
import { GetInstructorsByStatusDto } from './dto/get-instructors--by-status.dto';
import { UpdateInstructorStatusDto } from './dto/update-instructor-status.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});
const instructorIdMock = 'instructor-id';

describe('InstructorsController', () => {
  let instructorsController: InstructorsController;
  let instructorsService: InstructorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorsController],
      providers: [
        InstructorsService,
        {
          provide: getRepositoryToken(Instructor),
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

    instructorsService = module.get(InstructorsService);
    instructorsController = module.get(InstructorsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('registration', () => {
    it('should register user', async () => {
      const result = 'massage-about-registration';
      const dto = new CreateInstructorDto();

      jest
        .spyOn(instructorsService, 'createInstructor')
        .mockImplementation(() => Promise.resolve(result));

      expect(await instructorsController.registration(dto)).toBe(result);
    });
  });

  describe('createByAdmin', () => {
    it('should create instructor by admin', async () => {
      const result = new Instructor();
      const dto = new CreateInstructorByAdminDto();

      jest
        .spyOn(instructorsService, 'createInstructorByAdmin')
        .mockImplementation(() => Promise.resolve(result));

      expect(await instructorsController.createByAdmin(dto)).toBe(result);
    });
  });

  describe('getInstructorsByStatus', () => {
    it('should get instructors by status', async () => {
      const result = [new Instructor()];
      const dto = new GetInstructorsByStatusDto();

      jest
        .spyOn(instructorsService, 'getInstructorsByParams')
        .mockImplementation(() => Promise.resolve(result));

      expect(await instructorsController.getInstructorsByStatus(dto)).toBe(
        result,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update instructor is_active status', async () => {
      const result = new Instructor();
      const dto = new UpdateInstructorStatusDto();

      jest
        .spyOn(instructorsService, 'updateStatus')
        .mockImplementation(() => Promise.resolve(result));

      expect(
        await instructorsController.updateStatus(instructorIdMock, dto),
      ).toBe(result);
    });
  });

  describe('update', () => {
    it('should update instructor', async () => {
      const result = new Instructor();
      const dto = new UpdateInstructorDto();
      const reqMock = { user: { id: instructorIdMock } };

      jest
        .spyOn(instructorsService, 'updateInstructor')
        .mockImplementation(() => Promise.resolve(result));

      expect(await instructorsController.update(reqMock, dto)).toBe(result);
    });
  });

  describe('getAll', () => {
    it('should get all instructors', async () => {
      const result = [new Instructor()];

      jest
        .spyOn(instructorsService, 'getAllInstructors')
        .mockImplementation(() => Promise.resolve(result));

      expect(await instructorsController.getAll()).toBe(result);
    });
  });

  describe('getOneByAdmin', () => {
    it('should get instructor by ID by admin', async () => {
      const result = new Instructor();

      jest
        .spyOn(instructorsService, 'getInstructorById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await instructorsController.getOneByAdmin(instructorIdMock)).toBe(
        result,
      );
    });
  });

  describe('getOne', () => {
    it('should get instructor by ID', async () => {
      const result = new Instructor();
      const reqMock = { user: { id: instructorIdMock } };

      jest
        .spyOn(instructorsService, 'getInstructorById')
        .mockImplementation(() => Promise.resolve(result));

      expect(await instructorsController.getOne(reqMock)).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete instructor by ID', async () => {
      jest
        .spyOn(instructorsService, 'deleteInstructorById')
        .mockImplementation(() => Promise.resolve());

      await instructorsController.delete(instructorIdMock);

      expect(instructorsService.deleteInstructorById).toBeCalledWith(
        instructorIdMock,
      );
    });
  });
});
