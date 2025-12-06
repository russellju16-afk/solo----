import { FeishuService } from './feishu.service';
export declare class FeishuController {
    private readonly feishuService;
    constructor(feishuService: FeishuService);
    getConfig(): Promise<import("./entities/feishu-config.entity").FeishuConfig>;
    updateConfig(configData: any): Promise<import("./entities/feishu-config.entity").FeishuConfig>;
    testConnection(): Promise<{
        success: boolean;
        message: string;
    }>;
}
