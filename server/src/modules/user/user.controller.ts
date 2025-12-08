import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, Req } from '@nestjs/common';
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

  @Get('me')
  async findMe(@Req() req: any) {
    const user = await this.userService.findOneById(Number(req.user.userId));
    return this.sanitizeUser(user);
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

  @Put('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    const payload: any = {
      name: body.name,
      phone: body.phone,
      email: body.email,
    };
    const updated = await this.userService.update(Number(req.user.userId), payload);
    return this.sanitizeUser(updated);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(Number(id));
  }

  private sanitizeUser(user: any) {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role?.name || user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
