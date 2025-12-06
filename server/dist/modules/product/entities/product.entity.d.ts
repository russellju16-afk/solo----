import { ProductCategory } from './product-category.entity';
import { ProductBrand } from './product-brand.entity';
import { ProductImage } from './product-image.entity';
export declare class Product {
    id: number;
    name: string;
    category: ProductCategory;
    brand: ProductBrand;
    spec_weight: string;
    package_type: string;
    applicable_scenes: string[];
    moq: string;
    supply_area: string;
    description: string;
    status: number;
    latest_price_note: string;
    latest_price_updated_at: Date;
    price_trend: string;
    images: ProductImage[];
    created_at: Date;
    updated_at: Date;
}
