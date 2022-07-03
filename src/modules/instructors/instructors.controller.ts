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
import { Course } from '../../db/entities/course/course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { studentLessonsExampleDto } from '../students/dto/student-lessons-example.dto';
import { Student } from '../../db/entities/student/student.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

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
    return this.instructorsService.createInstructor(instructorDto);
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
    return this.instructorsService.createInstructorByAdmin(instructorDto);
  }

  @ApiOperation({ summary: 'Get instructors by status (only for admin)' })
  @ApiResponse({ type: [Instructor] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async getInstructorsByStatus(
    @Body() getInstructorsByStatusDto: GetInstructorsByStatusDto,
  ): Promise<Instructor[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructors by status`);
    return this.instructorsService.getInstructorsByParams({
      is_active: getInstructorsByStatusDto.is_active,
    });
  }

  @ApiOperation({
    summary: 'Update instructor is_active status by ID (only for admin)',
  })
  @ApiResponse({ type: Instructor })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Put(':id/status')
  async updateStatus(
    @Param('id') userId: string,
    @Body() statusDto: UpdateInstructorStatusDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} update instructor is_active status`);
    return this.instructorsService.updateStatus(userId, statusDto);
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
    return this.instructorsService.updateInstructor(
      req.user.id,
      updateInstructorDto,
    );
  }

  @ApiOperation({ summary: 'Get all instructors (only for admin)' })
  @ApiResponse({ type: [Instructor] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get()
  async getAll(): Promise<Instructor[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all instructors`);
    return this.instructorsService.getAllInstructors();
  }

  @ApiOperation({
    summary: 'Create course feedback (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Post('courses/:id/feedback')
  async createCourseFeedback(
    @Req() req,
    @Param('id') courseId: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} create course feedback`);
    return this.instructorsService.createCourseFeedback(
      req.user.id,
      courseId,
      createFeedbackDto,
    );
  }

  @ApiOperation({ summary: 'Get instructor courses (only for instructor)' })
  @ApiResponse({ type: [Course] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('courses')
  async getInstructorCourses(@Req() req): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor courses`);
    return this.instructorsService.getInstructorCourses(req.user.id);
  }

  @ApiOperation({
    summary: 'Get instructor course lessons (only for instructor)',
  })
  @ApiResponse({ schema: { example: studentLessonsExampleDto } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('courses/:id/lessons')
  async getInstructorCourseLessons(
    @Req() req,
    @Param('id') courseId: string,
  ): Promise<Lesson[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor course lessons`);
    return this.instructorsService.getInstructorCourseLessons(
      req.user.id,
      courseId,
    );
  }

  @ApiOperation({
    summary: 'Get instructor course students (only for instructor)',
  })
  @ApiResponse({ type: [Student] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('courses/:id/students')
  async getInstructorCourseStudents(
    @Req() req,
    @Param('id') courseId: string,
  ): Promise<Student[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor course students`);
    return this.instructorsService.getInstructorCourseStudents(
      req.user.id,
      courseId,
    );
  }

  @ApiOperation({ summary: 'Get instructor by ID (only for Admin)' })
  @ApiResponse({ type: Instructor })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get('admin/:id')
  async getOneByAdmin(@Param('id') id: string): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by ID by admin`);
    return this.instructorsService.getInstructorById(id);
  }

  @ApiOperation({ summary: 'Get instructor by ID' })
  @ApiResponse({ type: Instructor })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('data')
  async getOne(@Req() req): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by ID`);
    return this.instructorsService.getInstructorById(req.user.id);
  }

  @ApiOperation({ summary: 'Delete instructor by ID (only for admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete instructor by ID`);
    return this.instructorsService.deleteInstructorById(id);
  }
}
