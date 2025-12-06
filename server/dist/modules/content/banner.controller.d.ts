import { BannerService } from './banner.service';
export declare class BannerController {
    private readonly bannerService;
    constructor(bannerService: BannerService);
    findAll(query: any): Promise<import("./entities/banner.entity").Banner[]>;
    adminFindAll(query: any): Promise<import("./entities/banner.entity").Banner[]>;
    findOne(id: string): Promise<import("./entities/banner.entity").Banner>;
    create(createBannerDto: any): Promise<any>;
    update(id: string, updateBannerDto: any): Promise<import("./entities/banner.entity").Banner>;
    delete(id: string): Promise<void>;
    updateEnabled(id: string, body: {
        enabled: number;
    }): Promise<import("./entities/banner.entity").Banner>;
}
