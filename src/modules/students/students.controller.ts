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
import { studentLessonsExampleDto } from './dto/student-lessons-example.dto';
import { CourseFeedback } from '../../db/entities/course-feedback/course-feedback.entity';
import { StudentMark } from '../../db/entities/student-mark/student-mark.entity';

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
    return this.studentsService.createStudent(createStudentDto);
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
    return this.studentsService.createStudentByAdmin(createStudentByAdminDto);
  }

  @ApiOperation({ summary: 'Take a course (only for student)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Post('take-course')
  async takeCourse(@Req() req, @Body() takeCourseDto: TakeCourseDto) {
    this.logger.log(`${this.LOGGER_PREFIX} take a course`);
    return this.studentsService.takeCourse(
      req.user.id,
      takeCourseDto.course_id,
    );
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
    return this.studentsService.getStudentsByParams({
      is_active: getStudentsByStatusDto.is_active,
    });
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
    return this.studentsService.updateStatus(userId, statusDto);
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
    return this.studentsService.updateStudent(req.user.id, updateStudentDto);
  }

  @ApiOperation({ summary: 'Get student courses (only for student)' })
  @ApiResponse({ type: [Course] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Get('courses')
  async getStudentCourses(@Req() req): Promise<Course[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get student courses`);
    return this.studentsService.getStudentCourses(req.user.id);
  }

  @ApiOperation({ summary: 'Get student course lessons (only for student)' })
  @ApiResponse({ schema: { example: studentLessonsExampleDto } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Get('courses/:id/lessons')
  async getStudentCourseLessons(
    @Req() req,
    @Param('id') courseId: string,
  ): Promise<Lesson[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get student course lessons`);
    return this.studentsService.getStudentCourseLessons(req.user.id, courseId);
  }

  @ApiOperation({ summary: 'Get student lesson mark (only for student)' })
  @ApiResponse({ type: StudentMark })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Get('courses/:id/lessons/:lessonId/mark')
  async getLessonMark(
    @Req() req,
    @Param('id') courseId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<StudentMark> {
    this.logger.log(`${this.LOGGER_PREFIX} get student lesson mark`);
    return this.studentsService.getLessonMark(req.user.id, courseId, lessonId);
  }

  @ApiOperation({ summary: 'Get student course feedback (only for student)' })
  @ApiResponse({ type: CourseFeedback })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Get('courses/:id/feedback')
  async getCourseFeedback(
    @Req() req,
    @Param('id') courseId: string,
  ): Promise<CourseFeedback> {
    this.logger.log(`${this.LOGGER_PREFIX} get student course feedback`);
    return this.studentsService.getCourseFeedback(req.user.id, courseId);
  }

  @ApiOperation({ summary: 'Get all students (only for admin)' })
  @ApiResponse({ type: [Student] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get()
  async getAll(): Promise<Student[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all students`);
    return this.studentsService.getAllStudents();
  }

  @ApiOperation({ summary: 'Get student by ID (only for Admin)' })
  @ApiResponse({ type: Student })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get('admin/:id')
  async getOneByAdmin(@Param('id') id: string): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} get student by ID by admin`);
    return this.studentsService.getStudentById(id);
  }

  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ type: Student })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.STUDENT)
  @Get('data')
  async getOne(@Req() req): Promise<Student> {
    this.logger.log(`${this.LOGGER_PREFIX} get student by ID`);
    return this.studentsService.getStudentById(req.user.id);
  }

  @ApiOperation({ summary: 'Delete student by ID (only for admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete student by ID`);
    return this.studentsService.deleteStudentById(id);
  }
}
