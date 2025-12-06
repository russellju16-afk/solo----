import { Role } from './role.entity';
export declare class User {
    id: number;
    username: string;
    password_hash: string;
    name: string;
    phone: string;
    role: Role;
    status: number;
    created_at: Date;
    updated_at: Date;
}
