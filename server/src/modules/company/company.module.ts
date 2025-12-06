import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyInfo } from './entities/company-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyInfo])],
  providers: [],
  controllers: [],
  exports: [],
})
export class CompanyModule {}