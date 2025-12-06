"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_category_entity_1 = require("./entities/product-category.entity");
const product_brand_entity_1 = require("./entities/product-brand.entity");
const product_image_entity_1 = require("./entities/product-image.entity");
const product_service_1 = require("./product.service");
const product_controller_1 = require("./product.controller");
const product_category_service_1 = require("./product-category.service");
const product_category_controller_1 = require("./product-category.controller");
const product_brand_service_1 = require("./product-brand.service");
const product_brand_controller_1 = require("./product-brand.controller");
let ProductModule = class ProductModule {
};
exports.ProductModule = ProductModule;
exports.ProductModule = ProductModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                product_entity_1.Product,
                product_category_entity_1.ProductCategory,
                product_brand_entity_1.ProductBrand,
                product_image_entity_1.ProductImage,
            ]),
        ],
        controllers: [
            product_controller_1.ProductController,
            product_category_controller_1.ProductCategoryController,
            product_brand_controller_1.ProductBrandController,
        ],
        providers: [
            product_service_1.ProductService,
            product_category_service_1.ProductCategoryService,
            product_brand_service_1.ProductBrandService,
        ],
        exports: [product_service_1.ProductService],
    })
], ProductModule);
//# sourceMappingURL=product.module.js.map