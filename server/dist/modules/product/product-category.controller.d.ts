import { ProductCategoryService } from './product-category.service';
export declare class ProductCategoryController {
    private readonly categoryService;
    constructor(categoryService: ProductCategoryService);
    findAll(): Promise<import("./entities/product-category.entity").ProductCategory[]>;
    findOne(id: string): Promise<import("./entities/product-category.entity").ProductCategory>;
    create(createCategoryDto: any): Promise<any>;
    update(id: string, updateCategoryDto: any): Promise<import("./entities/product-category.entity").ProductCategory>;
    delete(id: string): Promise<void>;
}
