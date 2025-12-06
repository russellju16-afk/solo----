import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
export declare class UserService implements OnModuleInit {
    private userRepository;
    private roleRepository;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    findOneByUsername(username: string): Promise<User | undefined>;
    findOneById(id: number): Promise<User | undefined>;
    findAll(): Promise<User[]>;
    create(createUserDto: any): Promise<User>;
    update(id: number, updateUserDto: any): Promise<User>;
    delete(id: number): Promise<void>;
    onModuleInit(): Promise<void>;
    private initializeDefaultRoles;
    private initializeDefaultUser;
}
