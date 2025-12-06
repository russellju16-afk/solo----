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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const { username, password } = loginDto;
        console.log('Login attempt:', { username });
        const user = await this.userService.findOneByUsername(username);
        console.log('User found:', !!user);
        if (!user) {
            console.log('Login failed: User not found', { username });
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log('Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            console.log('Login failed: Invalid password', { username });
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        if (user.status === 0) {
            console.log('Login failed: User disabled', { username, status: user.status });
            throw new common_1.UnauthorizedException('用户已禁用');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role.name,
        };
        console.log('Login successful:', { username, userId: user.id });
        return {
            token: this.jwtService.sign(payload),
            userInfo: {
                id: user.id,
                username: user.username,
                name: user.name,
                phone: user.phone,
                role: user.role.name,
            },
        };
    }
    async resetPassword(username, newPassword) {
        console.log('Reset password attempt:', { username });
        const user = await this.userService.findOneByUsername(username);
        if (!user) {
            console.log('Reset password failed: User not found', { username });
            throw new common_1.UnauthorizedException('用户不存在');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userService.update(user.id, { password_hash: hashedPassword });
        console.log('Password reset successful:', { username, userId: user.id });
        return {
            message: '密码重置成功',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map