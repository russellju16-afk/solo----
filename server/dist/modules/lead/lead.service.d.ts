import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { UserService } from '../user/user.service';
import { FeishuService } from '../feishu/feishu.service';
import { CreateLeadDto } from './dto/create-lead.dto';
export declare class LeadService {
    private leadRepository;
    private userService;
    private feishuService;
    constructor(leadRepository: Repository<Lead>, userService: UserService, feishuService: FeishuService);
    private buildQueryBuilder;
    findAll(query: any): Promise<any>;
    findOneById(id: number): Promise<Lead | undefined>;
    create(createLeadDto: CreateLeadDto): Promise<any>;
    update(id: number, updateLeadDto: any): Promise<Lead>;
    delete(id: number): Promise<void>;
    updateStatus(id: number, status: string): Promise<Lead>;
    export(query: any): Promise<Lead[]>;
}
