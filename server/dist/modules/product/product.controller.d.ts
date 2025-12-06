import { ProductService } from './product.service';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    adminFindAll(query: any): Promise<any>;
    adminFindOne(id: string): Promise<import("./entities/product.entity").Product>;
    create(createProductDto: any): Promise<any>;
    update(id: string, updateProductDto: any): Promise<import("./entities/product.entity").Product>;
    delete(id: string): Promise<void>;
    updateStatus(id: string, body: {
        status: number;
    }): Promise<import("./entities/product.entity").Product>;
}
