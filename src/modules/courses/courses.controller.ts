import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRoles } from '../../constants';
import { Course } from '../../db/entities/course/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { AssignInstructorDto } from './dto/assign-instructor.dto';
import { GetCoursesByStatusDto } from './dto/get-courses-by-status.dto';

@ApiTags('Course')
@Controller('courses')
export class CoursesController {
  private LOGGER_PREFIX = '[CoursesController]:';
  private logger = new Logger();

  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Assign instructor for course (only for admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post('assign-instructor')
  async assignInstructor(@Body() assignInstructorDto: AssignInstructorDto) {
    this.logger.log(`${this.LOGGER_PREFIX} assign instructor for course`);
    try {
      return this.coursesService.assignInstructor(assignInstructorDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get courses by status (only for admin)' })
  @ApiResponse({ type: [Course] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async getCoursesByStatus(
    @Body() getCoursesByStatusDto: GetCoursesByStatusDto,
  ): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get courses by status`);
    try {
      return this.coursesService.getCoursesByParams({
        is_published: getCoursesByStatusDto.is_published,
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Create course (only for admin)' })
  @ApiResponse({ type: Course })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post('create')
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} create course`);
    try {
      return this.coursesService.createCourse(createCourseDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update course (only for admin)' })
  @ApiResponse({ type: Course })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Put(':id')
  async update(
    @Param('id') courseId: string,
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} update course`);
    try {
      return this.coursesService.updateCourse(courseId, createCourseDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Publish course (only for admin)' })
  @ApiResponse({ type: Course })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get(':id/publish')
  async publishCourse(@Param('id') courseId: string): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} publish course`);
    try {
      return this.coursesService.publishCourse(courseId);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get all published courses' })
  @ApiResponse({ type: [Course] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.INSTRUCTOR, UserRoles.STUDENT)
  @Get()
  async getAll(): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all published courses`);
    try {
      return this.coursesService.getAllCourses();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Delete course by ID (only for admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id') courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete course by ID`);
    try {
      return this.coursesService.deleteCourseById(courseId);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
