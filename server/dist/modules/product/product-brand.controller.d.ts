import { ProductBrandService } from './product-brand.service';
export declare class ProductBrandController {
    private readonly brandService;
    constructor(brandService: ProductBrandService);
    findAll(): Promise<import("./entities/product-brand.entity").ProductBrand[]>;
    findOne(id: string): Promise<import("./entities/product-brand.entity").ProductBrand>;
    create(createBrandDto: any): Promise<any>;
    update(id: string, updateBrandDto: any): Promise<import("./entities/product-brand.entity").ProductBrand>;
    delete(id: string): Promise<void>;
}
