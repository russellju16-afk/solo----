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
    const res = await this.userService.findAll(query);
    const data = Array.isArray(res?.data) ? res.data.map((user: any) => this.sanitizeUser(user)) : [];
    return {
      ...res,
      data,
    };
  }

  @Get('me')
  async findMe(@Req() req: any) {
    const user = await this.userService.findOneById(Number(req.user.userId));
    return this.sanitizeUser(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOneById(Number(id));
    return this.sanitizeUser(user);
  }

  @Post()
  async create(@Body() createUserDto: any) {
    const user = await this.userService.create(createUserDto);
    return this.sanitizeUser(user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    const user = await this.userService.update(Number(id), updateUserDto);
    return this.sanitizeUser(user);
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
