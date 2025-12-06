import { Repository } from 'typeorm';
import { ProductBrand } from './entities/product-brand.entity';
export declare class ProductBrandService {
    private brandRepository;
    constructor(brandRepository: Repository<ProductBrand>);
    findAll(): Promise<ProductBrand[]>;
    findOneById(id: number): Promise<ProductBrand | undefined>;
    create(createBrandDto: any): Promise<any>;
    update(id: number, updateBrandDto: any): Promise<ProductBrand>;
    delete(id: number): Promise<void>;
}
