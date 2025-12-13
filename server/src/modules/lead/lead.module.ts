import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { LeadFollowup } from './entities/lead-followup.entity';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { LeadFollowupService } from './lead-followup.service';
import { UserModule } from '../user/user.module';
import { FeishuModule } from '../feishu/feishu.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, LeadFollowup]),
    UserModule,
    FeishuModule,
    AnalyticsModule,
  ],
  controllers: [LeadController],
  providers: [LeadService, LeadFollowupService],
  exports: [LeadService],
})
export class LeadModule {}
