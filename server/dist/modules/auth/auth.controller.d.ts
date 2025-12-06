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
            status: number;
        };
    }>;
    getProfile(req: any): Promise<any>;
}
