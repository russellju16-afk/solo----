import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
export declare class BannerService {
    private bannerRepository;
    constructor(bannerRepository: Repository<Banner>);
    findAll(query?: any): Promise<Banner[]>;
    findOneById(id: number): Promise<Banner | undefined>;
    create(createBannerDto: any): Promise<any>;
    update(id: number, updateBannerDto: any): Promise<Banner>;
    delete(id: number): Promise<void>;
    updateEnabled(id: number, enabled: number): Promise<Banner>;
}
