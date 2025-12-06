import { User } from '../../user/entities/user.entity';
export declare class OperationLog {
    id: number;
    user: User;
    action: string;
    module: string;
    detail: string;
    created_at: Date;
}
