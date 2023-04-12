import { Controller, Get, UseFilters, HttpException, HttpStatus,UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Ctx, ListQueryOptions,Product, ProductService, RequestContext, SortParameter } from '@vendure/core'; 
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
  async findAll(@Ctx() ctx: RequestContext) {
    try {
      let listQuery : ListQueryOptions<Product> = {
        take:5,
        skip:0,
        sort:{
          name:'ASC'
        },
        filter:{
          name:{
            eq:"Laptop"
          }
        }
      }
      
      return this.productService.findAll(ctx,listQuery);
    } catch (error) {
      throw new HttpException('INTERNAL_SERVER_ERROR',HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}