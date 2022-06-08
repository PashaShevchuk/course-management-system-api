import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoles } from '../../constants';

@Injectable()
export class InstructorsService {
  private LOGGER_PREFIX = '[InstructorsService]:';
  private logger = new Logger();

  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async createInstructor(
    createInstructorDto: CreateInstructorDto,
  ): Promise<Instructor> {
    this.logger.log(`${this.LOGGER_PREFIX} create instructor`);

    const candidate = await this.getInstructorByParams({
      email: createInstructorDto.email,
    });

    if (candidate) {
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const instructorData = new Instructor();
    instructorData.first_name = createInstructorDto.first_name;
    instructorData.last_name = createInstructorDto.last_name;
    instructorData.email = createInstructorDto.email;
    instructorData.hash_password = await this.authService.hashPassword(
      createInstructorDto.password,
    );
    instructorData.is_active = createInstructorDto.is_active;
    instructorData.role = UserRoles.ADMIN;

    const instructor = await this.instructorRepository.save(instructorData);

    return instructor;
  }

  async getInstructorByParams(params: {
    [key: string]: string;
  }): Promise<Instructor | undefined> {
    this.logger.log(`${this.LOGGER_PREFIX} get instructor by params`);

    return await this.instructorRepository.findOne({ where: { ...params } });
  }
}
