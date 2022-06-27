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
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRoles } from '../../constants';
import { Lesson } from '../../db/entities/lesson/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';

@ApiTags('Lesson')
@Controller('lessons')
export class LessonsController {
  private LOGGER_PREFIX = '[LessonsController]:';
  private logger = new Logger();

  constructor(private readonly lessonsService: LessonsService) {}

  @ApiOperation({ summary: 'Create lesson (only for admin)' })
  @ApiResponse({ type: Lesson })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post('create')
  async create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    this.logger.log(`${this.LOGGER_PREFIX} create lesson`);
    return this.lessonsService.createLesson(createLessonDto);
  }

  @ApiOperation({ summary: 'Update lesson (only for admin)' })
  @ApiResponse({ type: Lesson })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Put(':id')
  async update(
    @Param('id') lessonId: string,
    @Body() updateLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    this.logger.log(`${this.LOGGER_PREFIX} update lesson`);
    return this.lessonsService.updateLesson(lessonId, updateLessonDto);
  }

  @ApiOperation({ summary: 'Get all lessons (only for admin)' })
  @ApiResponse({ type: [Lesson] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get()
  async getAll(): Promise<Lesson[]> {
    this.logger.log(`${this.LOGGER_PREFIX} get all lessons`);
    return this.lessonsService.getAllLessons();
  }

  @ApiOperation({ summary: 'Get lesson by ID (only for admin)' })
  @ApiResponse({ type: Lesson })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get(':id')
  async getOne(@Param('id') lessonId: string): Promise<Lesson> {
    this.logger.log(`${this.LOGGER_PREFIX} get lesson by Id`);
    return this.lessonsService.getLessonById(lessonId);
  }

  @ApiOperation({ summary: 'Delete lesson by ID (only for admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async delete(@Param('id') lessonId: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete lesson by Id`);
    return this.lessonsService.deleteLessonById(lessonId);
  }
}
