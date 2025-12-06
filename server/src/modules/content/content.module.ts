import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { News } from './entities/news.entity';
import { Case } from './entities/case.entity';
import { Solution } from './entities/solution.entity';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { CaseService } from './case.service';
import { CaseController } from './case.controller';
import { SolutionService } from './solution.service';
import { SolutionController } from './solution.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Banner,
      News,
      Case,
      Solution,
    ]),
  ],
  controllers: [
    BannerController,
    NewsController,
    CaseController,
    SolutionController,
  ],
  providers: [
    BannerService,
    NewsService,
    CaseService,
    SolutionService,
  ],
})
export class ContentModule {}
