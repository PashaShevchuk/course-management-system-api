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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRoles } from '../../constants';
import { CreateStudentByAdminDto } from './dto/create-student-by-admin.dto';
import { Student } from '../../db/entities/student/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { GetStudentsByStatusDto } from './dto/get-students--by-status.dto';
import { TakeCourseDto } from './dto/take-course.dto';
import { Course } from '../../db/entities/course/course.entity';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { studentLessonsExample } from './dto/student-lessons-example';

@ApiTags('Student')
@Controller('students')
@UseInterceptors(ClassSerializerInterceptor)
export class StudentsController {
  private LOGGER_PREFIX = '[StudentsController]:';
  private logger = new Logger();

  constructor(private readonly studentsService: StudentsService) {}

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ type: 'string' })
  @Post('registration')
  async registration(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<string> {
    this.logger.log(`${this.LOGGER_PREFIX} registration`);
    try {
      return this.studentsService.createStudent(createStudentDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Create student by admin' })
  @ApiResponse({ type: Student })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post('create')
  async createByAdmin(
    @Body() createStudentByAdminDto: CreateStudentByAdminDto,
  ): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} create student by admin`);
    try {
      return this.studentsService.createStudentByAdmin(createStudentByAdminDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Take a course (only for student)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Post('take-course')
  async takeCourse(@Req() req, @Body() takeCourseDto: TakeCourseDto) {
    this.logger.log(`${this.LOGGER_PREFIX} take a course`);
    try {
      return this.studentsService.takeCourse(
        req.user.id,
        takeCourseDto.course_id,
      );
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get students by status (only for admin)' })
  @ApiResponse({ type: [Student] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async getStudentsByStatus(
    @Body() getStudentsByStatusDto: GetStudentsByStatusDto,
  ): Promise<Student[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get students by status`);
    try {
      return this.studentsService.getStudentsByParams({
        is_active: getStudentsByStatusDto.is_active,
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({
    summary: 'Update student is_active status by ID (only for admin)',
  })
  @ApiResponse({ type: Student })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Put(':id/status')
  async updateStatus(
    @Param('id') userId: string,
    @Body() statusDto: UpdateStudentStatusDto,
  ): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} update student is_active status`);
    try {
      return this.studentsService.updateStatus(userId, statusDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Update student' })
  @ApiResponse({ type: Student })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Put()
  async update(
    @Req() req,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} update student`);
    try {
      return this.studentsService.updateStudent(req.user.id, updateStudentDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get student courses (only for student)' })
  @ApiResponse({ type: [Course] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Get('courses')
  async getStudentCourses(@Req() req): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get student courses`);
    try {
      return this.studentsService.getStudentCourses(req.user.id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get student course lessons (only for student)' })
  @ApiResponse({ schema: { example: studentLessonsExample } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Get('courses/:id/lessons')
  async getStudentCourseLessons(
    @Req() req,
    @Param('id') courseId: string,
  ): Promise<Lesson[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get student course lessons`);
    try {
      return this.studentsService.getStudentCourseLessons(
        req.user.id,
        courseId,
      );
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get all students (only for admin)' })
  @ApiResponse({ type: [Student] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get()
  async getAll(): Promise<Student[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all students`);
    try {
      return this.studentsService.getAllStudents();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get student by ID (only for Admin)' })
  @ApiResponse({ type: Student })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get('admin/:id')
  async getOneByAdmin(@Param('id') id: string): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} get student by ID by admin`);
    try {
      return this.studentsService.getStudentById(id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ type: Student })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Get('data')
  async getOne(@Req() req): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} get student by ID`);
    try {
      return this.studentsService.getStudentById(req.user.id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Delete student by ID (only for admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete student by ID`);
    try {
      return this.studentsService.deleteStudentById(id);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
