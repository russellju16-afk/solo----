import { BadRequestException, Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

// Public 路由 /api/products，Admin 路由 /api/admin/products/**（全局前缀 api）
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 前台接口：获取产品列表（无需认证）
  @Get('products')
  async findAll(@Query() query: any) {
    return this.productService.findAll(query);
  }

  // 前台接口：根据ID获取产品详情（无需认证）
  @Get('products/:id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOneById(Number(id));
  }

  // 前台接口：相关推荐（无需认证）
  @Get('products/:id/recommendations')
  async recommendations(@Param('id') id: string, @Query() query: any) {
    const limit = query.limit !== undefined ? Number(query.limit) : undefined;
    const categoryId = query.categoryId !== undefined ? Number(query.categoryId) : undefined;
    return this.productService.findRecommendations(Number(id), { limit, categoryId });
  }

  // 后台接口：获取产品列表（需要认证）
  @Get('admin/products')
  @UseGuards(AuthGuard('jwt'))
  async adminFindAll(@Query() query: any) {
    return this.productService.findAll(query);
  }

  // 后台接口：根据ID获取产品详情（需要认证）
  @Get('admin/products/:id')
  @UseGuards(AuthGuard('jwt'))
  async adminFindOne(@Param('id') id: string) {
    return this.productService.findOneById(Number(id));
  }

  // 后台接口：创建产品（需要认证）
  @Post('admin/products')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createProductDto: any) {
    return this.productService.create(createProductDto);
  }

  // 后台接口：更新产品（需要认证）
  @Put('admin/products/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productService.update(Number(id), updateProductDto);
  }

  // 后台接口：删除产品（需要认证）
  @Delete('admin/products/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.productService.delete(Number(id));
  }

  // 后台接口：更新产品状态（上下架）（需要认证）
  @Put('admin/products/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Param('id') id: string, @Body() body: { status: number }) {
    return this.productService.updateStatus(Number(id), body.status);
  }

  // 后台接口：下载批量导入模板（需要认证）
  @Get('admin/products/import-template')
  @UseGuards(AuthGuard('jwt'))
  async downloadImportTemplate(@Res() res: Response) {
    const buffer = await this.productService.generateImportTemplate();
    const filename = '产品批量导入模板.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.setHeader('Cache-Control', 'no-store');
    return res.end(buffer);
  }

  // 后台接口：批量导入产品（需要认证）
  @Post('admin/products/import')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase();
        if (!['.xlsx', '.xls'].includes(ext)) {
          return cb(new BadRequestException('仅支持上传 .xlsx/.xls 文件'), false);
        }
        return cb(null, true);
      },
    }),
  )
  async importProducts(
    @UploadedFile() file?: Express.Multer.File,
    @Query('commit') commit?: string,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('未找到上传文件字段 file');
    }
    const shouldCommit = ['1', 'true', 'yes', 'y'].includes(String(commit || '').trim().toLowerCase());
    return this.productService.importProductsFromExcel(file.buffer, {
      commit: shouldCommit,
      originalFilename: file.originalname,
    });
  }
}
