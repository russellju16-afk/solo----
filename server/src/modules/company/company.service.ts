import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyInfo } from './entities/company-info.entity';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyInfo)
    private readonly companyRepo: Repository<CompanyInfo>,
  ) {}

  // 确保有一条公司信息记录，避免前端 PUT 404（P0 修复）
  async ensureInfo(): Promise<CompanyInfo> {
    let info = await this.companyRepo.findOne({ where: {} });
    if (!info) {
      info = this.companyRepo.create({
        company_name: '',
        short_description: '',
        introduction: '',
        description: '',
        service_areas: '',
        service_channels: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        contact_person: '',
        business_hours: '',
        wechat_qr_code: '',
        social_media: '',
        seo_title: '',
        seo_keywords: '',
        seo_description: '',
        logo: '',
        banner_image: '',
      });
      info = await this.companyRepo.save(info);
    }
    return info;
  }

  async getInfo(): Promise<CompanyInfo> {
    return this.ensureInfo();
  }

  async updateInfo(dto: UpdateCompanyInfoDto): Promise<CompanyInfo> {
    const info = await this.ensureInfo();
    Object.assign(info, dto);
    return this.companyRepo.save(info);
  }
}
