import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLog } from './entities/operation-log.entity';
import { LoggingService } from './logging.service';
import { LoggingController } from './logging.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  providers: [LoggingService],
  controllers: [LoggingController],
  exports: [LoggingService],
})
export class LoggingModule {}
