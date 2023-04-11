import { Controller, Get, UseFilters, HttpException, HttpStatus,UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Ctx, ProductService, RequestContext } from '@vendure/core'; 
import { CustomExceptionFilter } from '../util/custom-exception.filter';
import { AuthGuard } from '../util/auth.guard';



@Controller('rest-api/products')
export class ProductsController {
  constructor(
    private jwtService: JwtService,
    private productService: ProductService) {}

  @Get()
  @UseFilters(new CustomExceptionFilter)
  @UseGuards(AuthGuard)
  @UseFilters()
  async findAll(@Ctx() ctx: RequestContext) {
    try {
      return this.productService.findAll(ctx);
    } catch (error) {
      throw new HttpException('INTERNAL_SERVER_ERROR',HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}