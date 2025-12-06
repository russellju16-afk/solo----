import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 前台接口：获取产品列表（无需认证）
  @Get('api/products')
  async findAll(@Query() query: any) {
    return this.productService.findAll(query);
  }

  // 前台接口：根据ID获取产品详情（无需认证）
  @Get('api/products/:id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOneById(Number(id));
  }

  // 后台接口：获取产品列表（需要认证）
  @Get('api/admin/products')
  @UseGuards(AuthGuard('jwt'))
  async adminFindAll(@Query() query: any) {
    return this.productService.findAll(query);
  }

  // 后台接口：根据ID获取产品详情（需要认证）
  @Get('api/admin/products/:id')
  @UseGuards(AuthGuard('jwt'))
  async adminFindOne(@Param('id') id: string) {
    return this.productService.findOneById(Number(id));
  }

  // 后台接口：创建产品（需要认证）
  @Post('api/admin/products')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createProductDto: any) {
    return this.productService.create(createProductDto);
  }

  // 后台接口：更新产品（需要认证）
  @Put('api/admin/products/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productService.update(Number(id), updateProductDto);
  }

  // 后台接口：删除产品（需要认证）
  @Delete('api/admin/products/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.productService.delete(Number(id));
  }

  // 后台接口：更新产品状态（上下架）（需要认证）
  @Put('api/admin/products/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Param('id') id: string, @Body() body: { status: number }) {
    return this.productService.updateStatus(Number(id), body.status);
  }
}
