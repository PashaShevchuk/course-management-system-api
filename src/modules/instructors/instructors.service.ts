import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateInstructorByAdminDto } from './dto/create-instructor-by-admin.dto';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplates, UserRoles } from '../../constants';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorStatusDto } from './dto/update-instructor-status.dto';
import { ConfigService } from '../../config/config.service';
import { MailService } from '../mail/mail.service';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

@Injectable()
export class InstructorsService {
  private LOGGER_PREFIX = '[InstructorsService]:';
  private logger = new Logger();

  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async createInstructorByAdmin(
    createInstructorDto: CreateInstructorByAdminDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} create instructor by admin`);

    const candidate = await this.getInstructorByParams({
      email: createInstructorDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const instructorData = new Instructor();
    instructorData.first_name = createInstructorDto.first_name;
    instructorData.last_name = createInstructorDto.last_name;
    instructorData.email = createInstructorDto.email;
    instructorData.position = createInstructorDto.position;
    instructorData.hash_password = await this.authService.hashPassword(
      createInstructorDto.password,
    );
    instructorData.is_active = createInstructorDto.is_active;
    instructorData.role = UserRoles.INSTRUCTOR;

    const instructor = await this.instructorRepository.save(instructorData);

    return instructor;
  }

  async getInstructorByParams(params: {
    [key: string]: any;
  }): Promise<Instructor | undefined> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by params`);

    return await this.instructorRepository.findOne({ where: { ...params } });
  }

  async getInstructorsByParams(params: {
    [key: string]: any;
  }): Promise<Instructor[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructors by params`);

    return await this.instructorRepository.find({ where: { ...params } });
  }

  async createInstructor(
    createInstructorDto: CreateInstructorDto,
  ): Promise<string> {
    this.logger.log(`${this.LOGGER_PREFIX} create instructor`);

    const candidate = await this.getInstructorByParams({
      email: createInstructorDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const instructorData = new Instructor();
    instructorData.first_name = createInstructorDto.first_name;
    instructorData.last_name = createInstructorDto.last_name;
    instructorData.email = createInstructorDto.email;
    instructorData.position = createInstructorDto.position;
    instructorData.hash_password = await this.authService.hashPassword(
      createInstructorDto.password,
    );
    instructorData.is_active = false;
    instructorData.role = UserRoles.INSTRUCTOR;

    await this.instructorRepository.save(instructorData);

    return 'The account data have been sent to the administrator for verification. After verification, you will receive an email.';
  }

  async getInstructorById(id: string): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by ID`);

    const instructor = await this.getInstructorByParams({ id });

    if (!instructor) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return instructor;
  }

  async updateStatus(
    id: string,
    statusDto: UpdateInstructorStatusDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} update instructor is_active status`);

    await this.instructorRepository.update(id, {
      is_active: statusDto.is_active,
    });
    const instructor = await this.getInstructorById(id);
    await this.authService.declineToken(id);

    if (statusDto.send_email && this.configService.isEmailEnable()) {
      await this.mailService.sendMail(
        instructor.email,
        EmailTemplates.CHANGE_STATUS,
        'Account status',
        {
          name: `${instructor.first_name} ${instructor.last_name}`,
          status: statusDto.is_active,
        },
      );
    }

    return instructor;
  }

  async updateInstructor(
    userId: string,
    updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} update instructor`);

    const instructor = await this.getInstructorById(userId);

    instructor.first_name = updateInstructorDto.first_name;
    instructor.last_name = updateInstructorDto.last_name;
    instructor.position = updateInstructorDto.position;

    if (updateInstructorDto.password) {
      instructor.hash_password = await this.authService.hashPassword(
        updateInstructorDto.password,
      );
      await this.authService.declineToken(userId);
    }

    await this.instructorRepository.save(instructor);

    return instructor;
  }

  async getAllInstructors(): Promise<Instructor[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all instructors`);

    const instructors = await this.instructorRepository.find();

    return instructors;
  }

  async deleteInstructorById(id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete instructor by ID`);

    const result = await this.instructorRepository.delete(id);

    if (!result.affected) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
  }
}
