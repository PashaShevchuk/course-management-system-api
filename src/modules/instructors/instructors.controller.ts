import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Logger,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRoles } from '../../constants';

@Controller('instructors')
@UseInterceptors(ClassSerializerInterceptor)
export class InstructorsController {
  private LOGGER_PREFIX = '[InstructorsController]:';
  private logger = new Logger();

  constructor(private readonly instructorsService: InstructorsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Post()
  async create(
    @Body() instructorDto: CreateInstructorDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} create instructor`);

    try {
      return this.instructorsService.createInstructor(instructorDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
