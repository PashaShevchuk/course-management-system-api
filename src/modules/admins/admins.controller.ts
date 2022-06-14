import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Admin } from '../../db/entities/admin/admin.entity';
import { Roles } from '../auth/role.decorator';
import { UserRoles } from '../../constants';
import { RolesGuard } from '../auth/role.guard';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';

@Controller('admins')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminsController {
  private LOGGER_PREFIX = '[AdminsController]:';
  private logger = new Logger();

  constructor(private readonly adminsService: AdminsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async create(@Body() adminDto: CreateAdminDto): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} create admin`);
    try {
      return this.adminsService.createAdmin(adminDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Put(':userId/status')
  async updateStatus(
    @Param('userId') userId: string,
    @Body() statusDto: UpdateAdminStatusDto,
  ): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} update admin is_active status`);
    try {
      return this.adminsService.updateStatus(userId, statusDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get()
  async getAll(): Promise<Admin[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all admins`);
    try {
      return this.adminsService.getAllAdmins();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} get admin by ID`);
    try {
      return this.adminsService.getAdminById(id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
