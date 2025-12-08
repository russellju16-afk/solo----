import { Controller, Get, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggingService } from './logging.service';

@Controller('admin/operation-logs')
@UseGuards(AuthGuard('jwt'))
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.loggingService.findAll(query);
  }

  @Delete('clear')
  async clearAll() {
    return this.loggingService.clearAll();
  }
}
