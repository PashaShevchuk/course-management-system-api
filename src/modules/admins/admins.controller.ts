import { Body, Controller, Post } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateAdminDto } from './dto/input/create-admin.dto';
import { AdminsService } from './admins.service';
import { CreateAdminResponseDto } from './dto/output/create-admin-response.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  async create(
    @Body() adminDto: CreateAdminDto,
  ): Promise<CreateAdminResponseDto> {
    try {
      const admin = await this.adminsService.createAdmin(adminDto);

      return plainToClass(CreateAdminResponseDto, admin, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      throw err;
    }
  }
}
