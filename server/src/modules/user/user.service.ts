import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  // 根据用户名查找用户
  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });
  }

  // 根据ID查找用户
  async findOneById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  // 获取所有用户
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['role'],
    });
  }

  // 创建用户
  async create(createUserDto: any): Promise<User> {
    const { username, password, name, phone, roleId } = createUserDto;

    // 检查用户名是否已存在
    const existingUser = await this.findOneByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 查找角色
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      username,
      password_hash: hashedPassword,
      name,
      phone,
      role,
      status: 1,
    });

    return this.userRepository.save(user);
  }

  // 更新用户
  async update(id: number, updateUserDto: any): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新密码，需要重新加密
    if (updateUserDto.password) {
      updateUserDto.password_hash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateUserDto.password;
    }

    // 如果更新角色，需要查找角色
    if (updateUserDto.roleId) {
      const role = await this.roleRepository.findOne({ where: { id: updateUserDto.roleId } });
      if (!role) {
        throw new NotFoundException('角色不存在');
      }
      user.role = role;
      delete updateUserDto.roleId;
    }

    // 更新用户信息
    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  // 删除用户
  async delete(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('用户不存在');
    }
  }

  // 模块初始化时执行
  async onModuleInit() {
    await this.initializeDefaultRoles();
    await this.initializeDefaultUser();
  }

  // 初始化默认角色
  private async initializeDefaultRoles() {
    const roles = [
      { name: 'admin', description: '超级管理员' },
      { name: 'editor', description: '内容编辑' },
      { name: 'viewer', description: '查看者' },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({ where: { name: roleData.name } });
      if (!existingRole) {
        await this.roleRepository.save(roleData);
      }
    }
  }

  // 初始化默认管理员用户
  private async initializeDefaultUser() {
    const defaultUsername = 'admin';
    const defaultPassword = '123456';
    const defaultName = '管理员';

    // 检查默认用户是否已存在
    const existingUser = await this.findOneByUsername(defaultUsername);
    if (!existingUser) {
      // 查找管理员角色
      const adminRole = await this.roleRepository.findOne({ where: { name: 'admin' } });
      if (adminRole) {
        // 密码加密
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // 创建默认管理员用户
        const defaultUser = this.userRepository.create({
          username: defaultUsername,
          password_hash: hashedPassword,
          name: defaultName,
          phone: '',
          role: adminRole,
          status: 1,
        });

        await this.userRepository.save(defaultUser);
        console.log(`默认管理员用户已创建：用户名 ${defaultUsername}，密码 ${defaultPassword}`);
      }
    }
  }
}
