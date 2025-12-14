import { Injectable } from '@nestjs/common';

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category_id?: number;
  tags?: string[];
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 1,
    question: '支持哪些配送区域？',
    answer: '目前覆盖西安及周边区域，支持到店自提与企业客户配送，具体以业务人员确认的配送范围为准。',
    tags: ['配送', '区域'],
  },
  {
    id: 2,
    question: '最小起订量是多少？',
    answer: '不同品类与规格起订量不同，您可以在产品详情页查看“起订量”，或提交表单获取报价与最小起订量说明。',
    tags: ['起订量', '报价'],
  },
  {
    id: 3,
    question: '可以提供发票吗？',
    answer: '支持开具正规发票。请在提交线索时备注开票信息与需求，我们会在报价/合同阶段确认。',
    tags: ['发票'],
  },
  {
    id: 4,
    question: '如何获取最新价格？',
    answer: '价格会随市场行情波动，建议通过“获取报价”提交线索，我们会根据您的采购量与配送地址给到实时价格。',
    tags: ['价格', '行情'],
  },
  {
    id: 5,
    question: '产品质量如何保障？',
    answer: '我们与正规品牌/渠道合作，入库与出库均有质量检查，确保品质稳定与可追溯。',
    tags: ['质量', '保障'],
  },
];

@Injectable()
export class FaqService {
  async findAll(options: { limit?: number; categoryId?: number } = {}): Promise<FaqItem[]> {
    const limit = Number.isFinite(options.limit)
      ? Math.min(Math.max(Number(options.limit), 1), 50)
      : 10;

    const categoryId = Number.isFinite(options.categoryId) ? Number(options.categoryId) : undefined;

    const rows = categoryId ? DEFAULT_FAQS.filter((item) => item.category_id === categoryId) : DEFAULT_FAQS;
    return rows.slice(0, limit);
  }
}

