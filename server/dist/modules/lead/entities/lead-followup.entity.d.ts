import { Lead } from './lead.entity';
import { User } from '../../user/entities/user.entity';
export declare class LeadFollowup {
    id: number;
    lead: Lead;
    operator: User;
    note: string;
    status_after: string;
    created_at: Date;
}
