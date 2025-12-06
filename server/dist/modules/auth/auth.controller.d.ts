import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        userInfo: {
            id: number;
            username: string;
            name: string;
            phone: string;
            role: string;
        };
    }>;
    resetPassword(body: {
        username: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
}
