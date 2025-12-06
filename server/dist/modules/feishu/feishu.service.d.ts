import { Repository } from 'typeorm';
import { FeishuConfig } from './entities/feishu-config.entity';
export declare class FeishuService {
    private feishuConfigRepo;
    private readonly logger;
    constructor(feishuConfigRepo: Repository<FeishuConfig>);
    getConfig(): Promise<FeishuConfig>;
    updateConfig(configData: Partial<FeishuConfig>): Promise<FeishuConfig>;
    testConnection(): Promise<boolean>;
    sendMessage(message: string): Promise<boolean>;
    sendLeadNotification(lead: any): Promise<boolean>;
    sendOperationLogNotification(log: any): Promise<boolean>;
}
