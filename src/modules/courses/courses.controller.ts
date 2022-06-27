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
import { courseLessonsExample } from './dto/course-lessons-example';

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
    return this.coursesService.assignInstructor(assignInstructorDto);
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
    return this.coursesService.getCoursesByParams({
      is_published: getCoursesByStatusDto.is_published,
    });
  }

  @ApiOperation({ summary: 'Create course (only for admin)' })
  @ApiResponse({ type: Course })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post('create')
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} create course`);
    return this.coursesService.createCourse(createCourseDto);
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
    return this.coursesService.updateCourse(courseId, createCourseDto);
  }

  @ApiOperation({ summary: 'Publish course (only for admin)' })
  @ApiResponse({ type: Course })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get(':id/publish')
  async publishCourse(@Param('id') courseId: string): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} publish course`);
    return this.coursesService.publishCourse(courseId);
  }

  @ApiOperation({ summary: 'Get course lessons' })
  @ApiResponse({ schema: { example: courseLessonsExample } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.INSTRUCTOR, UserRoles.STUDENT)
  @Get(':id/lessons')
  async getCourseLessons(@Param('id') courseId: string): Promise<Course> {
    this.logger.log(`${this.LOGGER_PREFIX} get course lessons`);
    return this.coursesService.getCourseLessons(courseId);
  }

  @ApiOperation({ summary: 'Get all published courses' })
  @ApiResponse({ type: [Course] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.INSTRUCTOR, UserRoles.STUDENT)
  @Get()
  async getAll(): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all published courses`);
    return this.coursesService.getAllCourses();
  }

  @ApiOperation({ summary: 'Delete course by ID (only for admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id') courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete course by ID`);
    return this.coursesService.deleteCourseById(courseId);
  }
}
