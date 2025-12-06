"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const banner_entity_1 = require("./entities/banner.entity");
const news_entity_1 = require("./entities/news.entity");
const case_entity_1 = require("./entities/case.entity");
const solution_entity_1 = require("./entities/solution.entity");
const banner_service_1 = require("./banner.service");
const banner_controller_1 = require("./banner.controller");
const news_service_1 = require("./news.service");
const news_controller_1 = require("./news.controller");
const case_service_1 = require("./case.service");
const case_controller_1 = require("./case.controller");
const solution_service_1 = require("./solution.service");
const solution_controller_1 = require("./solution.controller");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                banner_entity_1.Banner,
                news_entity_1.News,
                case_entity_1.Case,
                solution_entity_1.Solution,
            ]),
        ],
        controllers: [
            banner_controller_1.BannerController,
            news_controller_1.NewsController,
            case_controller_1.CaseController,
            solution_controller_1.SolutionController,
        ],
        providers: [
            banner_service_1.BannerService,
            news_service_1.NewsService,
            case_service_1.CaseService,
            solution_service_1.SolutionService,
        ],
    })
], ContentModule);
//# sourceMappingURL=content.module.js.map