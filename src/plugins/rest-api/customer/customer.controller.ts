import { Controller, Get } from '@nestjs/common';
import { Ctx, CustomerService, RequestContext } from '@vendure/core'; 

@Controller('rest-api/customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  findAll(@Ctx() ctx: RequestContext) {
    return this.customerService.findAll(ctx)
  }

  @Get('find')
  findOne(@Ctx() ctx: RequestContext){
    return this.customerService.findOne(ctx,1);
  }
}