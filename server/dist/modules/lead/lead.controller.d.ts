import { LeadService } from './lead.service';
import { LeadFollowupService } from './lead-followup.service';
import { CreateLeadDto } from './dto/create-lead.dto';
export declare class LeadController {
    private readonly leadService;
    private readonly followupService;
    constructor(leadService: LeadService, followupService: LeadFollowupService);
    create(createLeadDto: CreateLeadDto): Promise<{
        success: boolean;
        id: any;
    }>;
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<import("./entities/lead.entity").Lead>;
    update(id: string, updateLeadDto: any): Promise<import("./entities/lead.entity").Lead>;
    delete(id: string): Promise<void>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<import("./entities/lead.entity").Lead>;
    export(query: any): Promise<import("./entities/lead.entity").Lead[]>;
    getFollowups(id: string): Promise<import("./entities/lead-followup.entity").LeadFollowup[]>;
    createFollowup(id: string, createFollowupDto: any): Promise<import("./entities/lead-followup.entity").LeadFollowup>;
}
