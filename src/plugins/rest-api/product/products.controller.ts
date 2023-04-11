import { Controller, Get, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Ctx, ProductService, RequestContext } from '@vendure/core'; 
import { CustomExceptionFilter } from '../util/custom-exception.filter';



@Controller('rest-api/products')
export class ProductsController {
  constructor(
    private jwtService: JwtService,
    private productService: ProductService) {}

  @Get()
  @UseFilters(new CustomExceptionFilter)
  findAll(@Ctx() ctx: RequestContext) {
    try {
      return this.productService.findAll(ctx);
     //throw new HttpException('unexpected error',HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (error) {
      throw new HttpException('unexpected error',HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}