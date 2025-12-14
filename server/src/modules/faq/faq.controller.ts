import { Controller, Get, Query } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async findAll(@Query() query: any) {
    const limitRaw = query.limit ?? query.pageSize ?? query.page_size;
    const limit = limitRaw !== undefined ? Number(limitRaw) : undefined;
    const categoryIdRaw = query.categoryId ?? query.category_id;
    const categoryId = categoryIdRaw !== undefined ? Number(categoryIdRaw) : undefined;
    return this.faqService.findAll({ limit, categoryId });
  }
}

