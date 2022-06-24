import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateAdminByAdminDto } from './dto/create-admin-by-admin.dto';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Admin } from '../../db/entities/admin/admin.entity';
import { Roles } from '../auth/role.decorator';
import { UserRoles } from '../../constants';
import { RolesGuard } from '../auth/role.guard';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { GetAdminsByStatusDto } from './dto/get-admins--by-status.dto';

@ApiTags('Admin')
@Controller('admins')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminsController {
  private LOGGER_PREFIX = '[AdminsController]:';
  private logger = new Logger();

  constructor(private readonly adminsService: AdminsService) {}

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ type: 'string' })
  @Post('registration')
  async registration(@Body() adminDto: CreateAdminDto): Promise<string> {
    this.logger.log(`${this.LOGGER_PREFIX} registration`);
    try {
      return this.adminsService.createAdmin(adminDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Create admin by admin' })
  @ApiResponse({ type: Admin })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post('create')
  async createByAdmin(@Body() adminDto: CreateAdminByAdminDto): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} create admin by admin`);
    try {
      return this.adminsService.createAdminByAdmin(adminDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get admins by status (only for admin)' })
  @ApiResponse({ type: [Admin] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async getAdminsByStatus(
    @Body() getAdminsByStatusDto: GetAdminsByStatusDto,
  ): Promise<Admin[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get admins by status`);
    try {
      return this.adminsService.getAdminsByParams({
        is_active: getAdminsByStatusDto.is_active,
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({
    summary: 'Update admin is_active status by ID (only for admin)',
  })
  @ApiResponse({ type: Admin })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Put(':id/status')
  async updateStatus(
    @Param('id') userId: string,
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

  @ApiOperation({ summary: 'Update admin' })
  @ApiResponse({ type: Admin })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Put()
  async update(
    @Req() req,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<Admin> {
    this.logger.log(`${this.LOGGER_PREFIX} update admin`);
    try {
      return this.adminsService.updateAdmin(req.user.id, updateAdminDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get all admins (only for admin)' })
  @ApiResponse({ type: [Admin] })
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

  @ApiOperation({ summary: 'Get admin by ID (only for admin)' })
  @ApiResponse({ type: Admin })
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

  @ApiOperation({ summary: 'Delete admin by ID (only for admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete admin by ID`);
    try {
      return this.adminsService.deleteAdminById(id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
