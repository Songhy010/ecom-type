import { Controller, Get } from '@nestjs/common';
import { Ctx, ProductService, RequestContext } from '@vendure/core'; 

@Controller('rest-api/products')
export class ProductsController {
  constructor(private productService: ProductService) {}

  @Get()
  findAll(@Ctx() ctx: RequestContext) {
    return this.productService.findAll(ctx);
  }
}