import { Body, Controller, Post } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { CreateInstructorResponseDto } from './dto/create-instructor-response.dto';

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  async create(
    @Body() instructorDto: CreateInstructorDto,
  ): Promise<CreateInstructorResponseDto> {
    try {
      const instructor = await this.instructorsService.createInstructor(
        instructorDto,
      );

      return plainToClass(CreateInstructorResponseDto, instructor, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      throw err;
    }
  }
}
