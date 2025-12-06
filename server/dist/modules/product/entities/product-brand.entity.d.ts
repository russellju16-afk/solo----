import { Product } from './product.entity';
export declare class ProductBrand {
    id: number;
    name: string;
    description: string;
    sort_order: number;
    products: Product[];
}
