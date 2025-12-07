import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';

@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // 前台公开获取公司信息
  @Get('company-info')
  async getCompanyInfo() {
    const data = await this.companyService.getInfo();
    return { data };
  }

  // 后台获取公司信息（需要登录）
  @Get('admin/company-info')
  @UseGuards(AuthGuard('jwt'))
  async getAdminCompanyInfo() {
    const data = await this.companyService.getInfo();
    return { data };
  }

  // 后台更新公司信息（需要登录）
  @Put('admin/company-info')
  @UseGuards(AuthGuard('jwt'))
  async updateCompanyInfo(@Body() body: UpdateCompanyInfoDto) {
    const data = await this.companyService.updateInfo(body);
    return { data, message: 'ok' };
  }
}

