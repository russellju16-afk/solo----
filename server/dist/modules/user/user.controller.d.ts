import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(): Promise<import("./entities/user.entity").User[]>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    create(createUserDto: any): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: any): Promise<import("./entities/user.entity").User>;
    delete(id: string): Promise<void>;
}
