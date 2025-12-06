import { CaseService } from './case.service';
export declare class CaseController {
    private readonly caseService;
    constructor(caseService: CaseService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<import("./entities/case.entity").Case>;
    adminFindAll(query: any): Promise<any>;
    adminFindOne(id: string): Promise<import("./entities/case.entity").Case>;
    create(createCaseDto: any): Promise<any>;
    update(id: string, updateCaseDto: any): Promise<import("./entities/case.entity").Case>;
    delete(id: string): Promise<void>;
}
