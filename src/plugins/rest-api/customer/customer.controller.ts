import { Controller,Post, Get,UseFilters,UseGuards,HttpStatus } from '@nestjs/common';
import { Ctx, CustomerService, RequestContext,ExternalAuthenticationService,UserService } from '@vendure/core'; 
import { CustomExceptionFilter } from '../util/custom-exception.filter';
import { AuthGuard } from '../util/auth.guard';
import Utils from '../util/util';

@Controller('rest-api/customer')
export class CustomerController {
  constructor(
    private externalAuthenticationService: ExternalAuthenticationService,
    private userService: UserService,
    private customerService: CustomerService) {}

  @Get()
  @UseFilters(new CustomExceptionFilter)
  @UseGuards(AuthGuard)
  findAll(@Ctx() ctx: RequestContext) {
    
    return this.customerService.findAll(ctx)
  }

  @Post('find')
  @UseFilters(new CustomExceptionFilter)
  @UseGuards(AuthGuard)
  async findOne(@Ctx() ctx: RequestContext){
    try {
      const tokenPayload = ctx.req as any
      const user = await this.userService.getUserByEmailAddress(ctx,tokenPayload.user.identifier)
      const customer = await  this.customerService.findOneByUserId(ctx,tokenPayload.user.sub) as any;
      console.log(tokenPayload.user.sub)
      customer.user['loginMethod']= user?.authenticationMethods
      return Utils.response(customer,HttpStatus.OK);


    } catch (error) {
      throw error
    }
    //return await this.userService.getUserByEmailAddress(ctx,ctx.req?.body.identifier)

  }
}