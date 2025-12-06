import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProductBrandService } from './product-brand.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin/brands')
@UseGuards(AuthGuard('jwt'))
export class ProductBrandController {
  constructor(private readonly brandService: ProductBrandService) {}

  @Get()
  async findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.brandService.findOneById(Number(id));
  }

  @Post()
  async create(@Body() createBrandDto: any) {
    return this.brandService.create(createBrandDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBrandDto: any) {
    return this.brandService.update(Number(id), updateBrandDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.brandService.delete(Number(id));
  }
}
