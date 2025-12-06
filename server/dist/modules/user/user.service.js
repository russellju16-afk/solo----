"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const bcrypt = require("bcryptjs");
let UserService = class UserService {
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async findOneByUsername(username) {
        return this.userRepository.findOne({
            where: { username },
            relations: ['role'],
        });
    }
    async findOneById(id) {
        return this.userRepository.findOne({
            where: { id },
            relations: ['role'],
        });
    }
    async findAll() {
        return this.userRepository.find({
            relations: ['role'],
        });
    }
    async create(createUserDto) {
        const { username, password, name, phone, roleId } = createUserDto;
        const existingUser = await this.findOneByUsername(username);
        if (existingUser) {
            throw new Error('用户名已存在');
        }
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            throw new common_1.NotFoundException('角色不存在');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
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
    async update(id, updateUserDto) {
        const user = await this.findOneById(id);
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        if (updateUserDto.password) {
            updateUserDto.password_hash = await bcrypt.hash(updateUserDto.password, 10);
            delete updateUserDto.password;
        }
        if (updateUserDto.roleId) {
            const role = await this.roleRepository.findOne({ where: { id: updateUserDto.roleId } });
            if (!role) {
                throw new common_1.NotFoundException('角色不存在');
            }
            user.role = role;
            delete updateUserDto.roleId;
        }
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }
    async delete(id) {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('用户不存在');
        }
    }
    async onModuleInit() {
        await this.initializeDefaultRoles();
        await this.initializeDefaultUser();
    }
    async initializeDefaultRoles() {
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
    async initializeDefaultUser() {
        const defaultUsername = 'admin';
        const defaultPassword = '123456';
        const defaultName = '管理员';
        const existingUser = await this.findOneByUsername(defaultUsername);
        if (!existingUser) {
            const adminRole = await this.roleRepository.findOne({ where: { name: 'admin' } });
            if (adminRole) {
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);
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
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map