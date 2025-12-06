import { Repository } from 'typeorm';
import { LeadFollowup } from './entities/lead-followup.entity';
import { Lead } from './entities/lead.entity';
import { UserService } from '../user/user.service';
export declare class LeadFollowupService {
    private followupRepository;
    private leadRepository;
    private userService;
    constructor(followupRepository: Repository<LeadFollowup>, leadRepository: Repository<Lead>, userService: UserService);
    findByLeadId(leadId: number): Promise<LeadFollowup[]>;
    create(leadId: number, createFollowupDto: any): Promise<LeadFollowup>;
    findOneById(id: number): Promise<LeadFollowup | undefined>;
    update(id: number, updateFollowupDto: any): Promise<LeadFollowup>;
    delete(id: number): Promise<void>;
}
