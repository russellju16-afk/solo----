import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
export declare class ProductCategoryService {
    private categoryRepository;
    constructor(categoryRepository: Repository<ProductCategory>);
    findAll(): Promise<ProductCategory[]>;
    findOneById(id: number): Promise<ProductCategory | undefined>;
    create(createCategoryDto: any): Promise<any>;
    update(id: number, updateCategoryDto: any): Promise<ProductCategory>;
    delete(id: number): Promise<void>;
}
