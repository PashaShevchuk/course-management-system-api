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
  Res,
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
import { CourseFeedback } from '../../db/entities/course-feedback/course-feedback.entity';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { PutMarkForStudentDto } from './dto/put-mark-for-student.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';
import { lessonMarksExampleDto } from './dto/lesson-marks-example.dto';
import { PutFinalMarkForStudentDto } from './dto/put-final-mark-for-student.dto';
import { courseStudentsDataExampleDto } from './dto/course-students-data-example.dto';
import { lessonHomeworkExampleDto } from './dto/lesson-homework-example.dto';
import { GetHomeworkFileDto } from './dto/get-homework-file.dto';

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

  @ApiOperation({
    summary: 'Update course feedback (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Put('courses/:id/feedback')
  async updateCourseFeedback(
    @Req() req,
    @Param('id') courseId: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} update course feedback`);
    return this.instructorsService.updateCourseFeedback(
      req.user.id,
      courseId,
      updateFeedbackDto,
    );
  }

  @ApiOperation({
    summary: 'Get instructor course feedbacks (only for instructor)',
  })
  @ApiResponse({ type: [CourseFeedback] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('courses/:id/feedback')
  async getCourseFeedbacks(
    @Req() req,
    @Param('id') courseId: string,
  ): Promise<CourseFeedback[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor course feedbacks`);
    return this.instructorsService.getCourseFeedbacks(req.user.id, courseId);
  }

  @ApiOperation({
    summary: 'Delete instructor course feedback (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Delete('courses/:id/feedback/:feedbackId')
  async deleteCourseFeedback(
    @Req() req,
    @Param('id') courseId: string,
    @Param('feedbackId') feedbackId: string,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} delete instructor course feedback`);
    return this.instructorsService.deleteCourseFeedback(
      req.user.id,
      courseId,
      feedbackId,
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
    summary: 'Put final marks for all students (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Post('courses/:id/final-marks')
  async putFinalMarksForStudents(@Req() req, @Param('id') courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} put final marks for students`);
    return this.instructorsService.putFinalMarksForStudents(
      req.user.id,
      courseId,
    );
  }

  @ApiOperation({
    summary: 'Put pass course for students (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Post('courses/:id/pass')
  async putPassCourseForStudents(@Req() req, @Param('id') courseId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} put pass course for students`);
    return this.instructorsService.putPassCourseForStudents(
      req.user.id,
      courseId,
    );
  }

  @ApiOperation({
    summary: 'Put pass course for a student (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Post('course-pass')
  async putPassCourseForStudent(
    @Req() req,
    @Body() putPassCourseForStudentDto: PutFinalMarkForStudentDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} put pass course for a student`);
    return this.instructorsService.putPassCourseForStudent(
      req.user.id,
      putPassCourseForStudentDto,
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

  @ApiOperation({
    summary:
      'Get course students data: final marks, is course pass (only for instructor)',
  })
  @ApiResponse({ schema: { example: [courseStudentsDataExampleDto] } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('courses/:id/students-data')
  async getStudentsData(
    @Req() req,
    @Param('id') courseId: string,
  ): Promise<typeof courseStudentsDataExampleDto[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get course students data`);
    return this.instructorsService.getStudentsData(req.user.id, courseId);
  }

  @ApiOperation({
    summary: 'Get instructor course lessons (only for instructor)',
  })
  @ApiResponse({ schema: { example: [studentLessonsExampleDto] } })
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
    summary: 'Get course lesson marks (only for instructor)',
  })
  @ApiResponse({ schema: { example: [lessonMarksExampleDto] } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('courses/:id/lessons/:lessonId/marks')
  async getLessonMarks(
    @Req() req,
    @Param('id') courseId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<typeof lessonMarksExampleDto[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get course lesson marks`);
    return this.instructorsService.getLessonMarks(
      req.user.id,
      courseId,
      lessonId,
    );
  }

  @ApiOperation({
    summary: 'Get course lesson homeworks (only for instructor)',
  })
  @ApiResponse({ schema: { example: [lessonHomeworkExampleDto] } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Get('courses/:id/lessons/:lessonId/homeworks')
  async getLessonHomeworks(
    @Req() req,
    @Param('id') courseId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<typeof lessonHomeworkExampleDto[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get course lesson homeworks`);
    return this.instructorsService.getLessonHomeworks(
      req.user.id,
      courseId,
      lessonId,
    );
  }

  @ApiOperation({
    summary: 'Get course lesson homework file (only for instructor)',
  })
  @ApiResponse({ schema: { example: 'file-stream' } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Post('homeworks')
  async getLessonHomeworkFile(
    @Req() req,
    @Res() res,
    @Body() getHomeworkFileDto: GetHomeworkFileDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} get course lesson homework file`);

    const file = await this.instructorsService.getLessonHomeworkFile(
      req.user.id,
      getHomeworkFileDto,
    );

    res.setHeader('Content-Type', file.contentType);
    file.stream.pipe(res);
  }

  @ApiOperation({
    summary: 'Put a mark for a student (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Post('marks')
  async putMarkForStudent(
    @Req() req,
    @Body() putMarkForStudentDto: PutMarkForStudentDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} put a mark for a student`);
    return this.instructorsService.putMarkForStudent(
      req.user.id,
      putMarkForStudentDto,
    );
  }

  @ApiOperation({
    summary: 'Update a student mark (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Put('marks')
  async updateStudentMark(@Req() req, @Body() updateMarkDto: UpdateMarkDto) {
    this.logger.log(`${this.LOGGER_PREFIX} update a student mark`);
    return this.instructorsService.updateStudentMark(
      req.user.id,
      updateMarkDto,
    );
  }

  @ApiOperation({
    summary: 'Put a final mark for a student (only for instructor)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.INSTRUCTOR)
  @Post('final-mark')
  async putFinalMarkForStudent(
    @Req() req,
    @Body() putFinalMarkForStudentDto: PutFinalMarkForStudentDto,
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} put a final mark for a student`);
    return this.instructorsService.putFinalMarkForStudent(
      req.user.id,
      putFinalMarkForStudentDto,
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
