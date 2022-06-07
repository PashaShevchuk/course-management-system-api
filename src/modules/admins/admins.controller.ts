import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
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

@Controller('admins')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async create(@Body() adminDto: CreateAdminDto): Promise<Admin> {
    try {
      return this.adminsService.createAdmin(adminDto);
    } catch (err) {
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get()
  async getAll(): Promise<Admin[]> {
    try {
      return this.adminsService.getAllAdmins();
    } catch (err) {
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Admin> {
    try {
      return this.adminsService.getAdminById(id);
    } catch (err) {
      throw err;
    }
  }
}
