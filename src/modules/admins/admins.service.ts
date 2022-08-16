import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../../db/entities/admin/admin.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateAdminByAdminDto } from './dto/create-admin-by-admin.dto';
import { EmailTemplates, UserRoles } from '../../constants';
import { AuthService } from '../auth/auth.service';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '../../config/config.service';
import { Homework } from '../../db/entities/homework/homework.entity';
import { StorageFile } from '../storage/storage-file';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AdminsService {
  private LOGGER_PREFIX = '[AdminsService]:';
  private logger = new Logger();

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Homework)
    private readonly homeworkRepository: Repository<Homework>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<string> {
    this.logger.log(`${this.LOGGER_PREFIX} create admin`);

    const candidate = await this.getAdminByParams({
      email: createAdminDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const adminData = new Admin();
    adminData.first_name = createAdminDto.first_name;
    adminData.last_name = createAdminDto.last_name;
    adminData.email = createAdminDto.email;
    adminData.hash_password = await this.authService.hashPassword(
      createAdminDto.password,
    );
    adminData.is_active = false;
    adminData.role = UserRoles.ADMIN;

    await this.adminRepository.save(adminData);

    return 'The account data have been sent to the administrator for verification. After verification, you will receive an email.';
  }

  async createAdminByAdmin(
    createAdminByAdminDto: CreateAdminByAdminDto,
  ): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} create admin by admin`);

    const candidate = await this.getAdminByParams({
      email: createAdminByAdminDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const adminData = new Admin();
    adminData.first_name = createAdminByAdminDto.first_name;
    adminData.last_name = createAdminByAdminDto.last_name;
    adminData.email = createAdminByAdminDto.email;
    adminData.hash_password = await this.authService.hashPassword(
      createAdminByAdminDto.password,
    );
    adminData.is_active = createAdminByAdminDto.is_active;
    adminData.role = UserRoles.ADMIN;

    const admin = await this.adminRepository.save(adminData);

    return admin;
  }

  async getAdminByParams(params: {
    [key: string]: any;
  }): Promise<Admin | undefined> {
    this.logger.log(`${this.LOGGER_PREFIX} get admin by params`);

    return await this.adminRepository.findOne({ where: { ...params } });
  }

  async getAdminsByParams(params: { [key: string]: any }): Promise<Admin[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get admins by params`);

    return await this.adminRepository.find({ where: { ...params } });
  }

  async getAllAdmins(): Promise<Admin[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all admins`);

    const admins = await this.adminRepository.find();

    return admins;
  }

  async getAdminById(id: string): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} get admin by ID`);

    const admin = await this.getAdminByParams({ id });

    if (!admin) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return admin;
  }

  async updateStatus(
    adminId: string,
    statusDto: UpdateAdminStatusDto,
  ): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} update admin is_active status`);

    await this.adminRepository.update(adminId, {
      is_active: statusDto.is_active,
    });
    const admin = await this.getAdminById(adminId);
    await this.authService.declineToken(adminId);

    if (statusDto.send_email) {
      await this.mailService.sendMail(
        admin.email,
        EmailTemplates.CHANGE_STATUS,
        'Account status',
        {
          name: `${admin.first_name} ${admin.last_name}`,
          status: statusDto.is_active,
        },
      );
    }

    return admin;
  }

  async updateAdmin(
    adminId: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} update admin`);

    const admin = await this.getAdminById(adminId);

    admin.first_name = updateAdminDto.first_name;
    admin.last_name = updateAdminDto.last_name;

    if (updateAdminDto.password) {
      admin.hash_password = await this.authService.hashPassword(
        updateAdminDto.password,
      );
      await this.authService.declineToken(adminId);
    }

    await this.adminRepository.save(admin);

    return admin;
  }

  async deleteAdminById(id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete admin by ID`);

    const result = await this.adminRepository.delete(id);

    if (!result.affected) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    await this.authService.declineToken(id);
  }

  async getHomeworks(): Promise<Homework[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get homeworks list`);

    const homeworks = await this.homeworkRepository.find({
      relations: {
        student: true,
        lesson: true,
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        student: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
        lesson: {
          id: true,
          title: true,
        },
      },
    });

    return homeworks;
  }

  async getHomeworkFile(homeworkId: string): Promise<StorageFile> {
    this.logger.log(`${this.LOGGER_PREFIX} get homework file`);

    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId },
    });

    if (!homework) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    return this.storageService.get(homework.file_path);
  }

  async deleteHomeworkFile(homeworkId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete homework file`);

    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId },
    });

    if (!homework) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Homework, { id: homeworkId });
      await this.storageService.delete(homework.file_path);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
