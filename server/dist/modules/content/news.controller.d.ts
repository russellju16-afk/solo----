import { NewsService } from './news.service';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<import("./entities/news.entity").News>;
    adminFindAll(query: any): Promise<any>;
    adminFindOne(id: string): Promise<import("./entities/news.entity").News>;
    create(createNewsDto: any): Promise<any>;
    update(id: string, updateNewsDto: any): Promise<import("./entities/news.entity").News>;
    delete(id: string): Promise<void>;
}
