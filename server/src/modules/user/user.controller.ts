import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

// Admin 用户路由统一暴露为 /api/admin/users/**
@Controller('admin/users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOneById(Number(id));
  }

  @Post()
  async create(@Body() createUserDto: any) {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.userService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(Number(id));
  }
}
