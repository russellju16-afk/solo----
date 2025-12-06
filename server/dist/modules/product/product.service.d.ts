import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
export declare class ProductService {
    private productRepository;
    constructor(productRepository: Repository<Product>);
    private buildQueryBuilder;
    findAll(query: any): Promise<any>;
    findOneById(id: number): Promise<Product | undefined>;
    create(createProductDto: any): Promise<any>;
    update(id: number, updateProductDto: any): Promise<Product>;
    delete(id: number): Promise<void>;
    updateStatus(id: number, status: number): Promise<Product>;
}
