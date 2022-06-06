import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../../db/entities/admin/admin.entity';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dto/input/create-admin.dto';
import { UserRoles } from '../../constants';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const candidate = await this.getUserByParams({
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
    adminData.is_active = createAdminDto.is_active;
    adminData.role = UserRoles.ADMIN;

    const admin = await this.adminRepository.save(adminData);

    return admin;
  }

  async getUserByParams(params: {
    [key: string]: string;
  }): Promise<Admin | undefined> {
    return await this.adminRepository.findOne({ where: { ...params } });
  }
}
