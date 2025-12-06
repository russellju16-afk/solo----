import { Repository } from 'typeorm';
import { Solution } from './entities/solution.entity';
export declare class SolutionService {
    private solutionRepository;
    constructor(solutionRepository: Repository<Solution>);
    private buildQueryBuilder;
    findAll(query: any): Promise<any>;
    findOneById(id: number): Promise<Solution | undefined>;
    create(createSolutionDto: any): Promise<any>;
    update(id: number, updateSolutionDto: any): Promise<Solution>;
    delete(id: number): Promise<void>;
}
