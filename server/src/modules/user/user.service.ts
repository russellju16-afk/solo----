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

  // 解析角色（支持 roleId 或 role/roleName）
  private async resolveRole(roleId?: number, roleName?: string): Promise<Role | null> {
    if (roleId) {
      const roleById = await this.roleRepository.findOne({ where: { id: roleId } });
      if (roleById) return roleById;
    }
    if (roleName) {
      const roleByName = await this.roleRepository.findOne({ where: { name: roleName } });
      if (roleByName) return roleByName;
    }
    return null;
  }

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

  // 获取所有用户（支持筛选与分页）
  async findAll(query: any = {}): Promise<any> {
    const page = parseInt(query.page || '1', 10);
    const pageSize = parseInt(query.pageSize || '10', 10);
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('user.id', 'DESC');

    if (query.keyword) {
      qb.andWhere('(user.username LIKE :keyword OR user.name LIKE :keyword OR user.email LIKE :keyword)', {
        keyword: `%${query.keyword}%`,
      });
    }

    if (query.role) {
      qb.andWhere('role.name = :roleName', { roleName: query.role });
    }

    if (query.status !== undefined && query.status !== null && query.status !== '') {
      qb.andWhere('user.status = :status', { status: Number(query.status) });
    }

    const [data, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  // 创建用户
  async create(createUserDto: any): Promise<User> {
    const { username, password, name, phone, email, roleId, role, roleName } = createUserDto;

    // 检查用户名是否已存在
    const existingUser = await this.findOneByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    if (email) {
      const existingEmail = await this.userRepository.findOne({ where: { email } });
      if (existingEmail) {
        throw new Error('邮箱已被使用');
      }
    }

    // 查找角色
    const roleEntity = await this.resolveRole(roleId, role || roleName);
    if (!roleEntity) {
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
      email,
      role: roleEntity,
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
    if (updateUserDto.roleId || updateUserDto.role || updateUserDto.roleName) {
      const role = await this.resolveRole(updateUserDto.roleId, updateUserDto.role || updateUserDto.roleName);
      if (!role) {
        throw new NotFoundException('角色不存在');
      }
      user.role = role;
      delete updateUserDto.roleId;
      delete updateUserDto.role;
      delete updateUserDto.roleName;
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
      if (existingEmail && existingEmail.id !== user.id) {
        throw new Error('邮箱已被使用');
      }
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
