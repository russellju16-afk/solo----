import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
export declare class CaseService {
    private caseRepository;
    constructor(caseRepository: Repository<Case>);
    private buildQueryBuilder;
    findAll(query: any): Promise<any>;
    findOneById(id: number): Promise<Case | undefined>;
    create(createCaseDto: any): Promise<any>;
    update(id: number, updateCaseDto: any): Promise<Case>;
    delete(id: number): Promise<void>;
}
