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
import { InstructorsService } from './instructors.service';
import { CreateInstructorByAdminDto } from './dto/create-instructor-by-admin.dto';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRoles } from '../../constants';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorStatusDto } from './dto/update-instructor-status.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { GetInstructorsByStatusDto } from './dto/get-instructors--by-status.dto';

@ApiTags('Instructor')
@Controller('instructors')
@UseInterceptors(ClassSerializerInterceptor)
export class InstructorsController {
  private LOGGER_PREFIX = '[InstructorsController]:';
  private logger = new Logger();

  constructor(private readonly instructorsService: InstructorsService) {}

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ type: 'string' })
  @Post('registration')
  async registration(
    @Body() instructorDto: CreateInstructorDto,
  ): Promise<string> {
    this.logger.log(`${this.LOGGER_PREFIX} registration`);
    try {
      return this.instructorsService.createInstructor(instructorDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Create instructor by admin' })
  @ApiResponse({ type: Instructor })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post('create')
  async createByAdmin(
    @Body() instructorDto: CreateInstructorByAdminDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} create instructor by admin`);
    try {
      return this.instructorsService.createInstructorByAdmin(instructorDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get instructors by status' })
  @ApiResponse({ type: [Instructor] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async getInstructorsByStatus(
    @Body() getInstructorsByStatusDto: GetInstructorsByStatusDto,
  ): Promise<Instructor[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructors by status`);
    try {
      return this.instructorsService.getInstructorsByParams({
        is_active: getInstructorsByStatusDto.is_active,
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update instructor is_active status by ID' })
  @ApiResponse({ type: Instructor })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Put(':id/status')
  async updateStatus(
    @Param('id') userId: string,
    @Body() statusDto: UpdateInstructorStatusDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} update instructor is_active status`);
    try {
      return this.instructorsService.updateStatus(userId, statusDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update instructor' })
  @ApiResponse({ type: Instructor })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Put()
  async update(
    @Req() req,
    @Body() updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} update instructor`);
    try {
      return this.instructorsService.updateInstructor(
        req.user.id,
        updateInstructorDto,
      );
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get all instructors' })
  @ApiResponse({ type: [Instructor] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get()
  async getAll(): Promise<Instructor[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all instructors`);
    try {
      return this.instructorsService.getAllInstructors();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get instructor by ID (only for Admin)' })
  @ApiResponse({ type: Instructor })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get('admin/:id')
  async getOneByAdmin(@Param('id') id: string): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by ID by admin`);
    try {
      return this.instructorsService.getInstructorById(id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get instructor by ID' })
  @ApiResponse({ type: Instructor })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('data')
  async getOne(@Req() req): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by ID`);
    try {
      return this.instructorsService.getInstructorById(req.user.id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Delete instructor by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete instructor by ID`);
    try {
      return this.instructorsService.deleteInstructorById(id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
