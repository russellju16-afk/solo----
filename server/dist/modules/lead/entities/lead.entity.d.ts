import { LeadFollowup } from './lead-followup.entity';
import { User } from '../../user/entities/user.entity';
export declare class Lead {
    id: number;
    name: string;
    companyName: string;
    phone: string;
    city: string;
    channelType: string;
    interestedCategories: string[];
    monthlyVolumeSegment: string;
    brandRequirement: string;
    description: string;
    productId: string;
    source: string;
    status: string;
    ownerId: number;
    owner: User;
    followups: LeadFollowup[];
    createdAt: Date;
    updatedAt: Date;
}
