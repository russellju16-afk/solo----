import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
export declare class NewsService {
    private newsRepository;
    constructor(newsRepository: Repository<News>);
    private buildQueryBuilder;
    findAll(query: any): Promise<any>;
    findOneById(id: number): Promise<News | undefined>;
    create(createNewsDto: any): Promise<any>;
    update(id: number, updateNewsDto: any): Promise<News>;
    delete(id: number): Promise<void>;
}
