import { SolutionService } from './solution.service';
export declare class SolutionController {
    private readonly solutionService;
    constructor(solutionService: SolutionService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<import("./entities/solution.entity").Solution>;
    adminFindAll(query: any): Promise<any>;
    adminFindOne(id: string): Promise<import("./entities/solution.entity").Solution>;
    create(createSolutionDto: any): Promise<any>;
    update(id: string, updateSolutionDto: any): Promise<import("./entities/solution.entity").Solution>;
    delete(id: string): Promise<void>;
}
