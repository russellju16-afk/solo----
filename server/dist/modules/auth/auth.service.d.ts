import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        userInfo: {
            id: number;
            username: string;
            name: string;
            phone: string;
            role: string;
            status: number;
        };
    }>;
}
