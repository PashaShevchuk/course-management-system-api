import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('live')
  getLive(): string {
    return 'success';
  }
}
