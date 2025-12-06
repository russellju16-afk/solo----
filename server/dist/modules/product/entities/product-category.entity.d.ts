import { Product } from './product.entity';
export declare class ProductCategory {
    id: number;
    name: string;
    sort_order: number;
    products: Product[];
}
