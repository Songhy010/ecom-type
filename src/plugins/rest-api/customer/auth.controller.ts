import { Controller, Get , Post} from '@nestjs/common';
import { Ctx, CustomerService,UserService, RequestContext } from '@vendure/core'; 
import { CreateCustomerInput } from '@vendure/common/lib/generated-types';

@Controller('rest-api/auth')
export class AuthController {
  constructor(
    private customerService: CustomerService,
    private userService: UserService) 
    {}

  @Get('login')
  login(@Ctx() ctx: RequestContext){
    console.log(ctx.req?.body.username);
    var param = ctx.req?.body
    return this.userService.getUserByEmailAddress(ctx,param.username,"customer")
  }

  @Post('register')
  register(@Ctx() ctx: RequestContext){
    let input : CreateCustomerInput = {
      title : "",
      firstName : "",
      lastName : "",
      phoneNumber:"",
      emailAddress:"simassi.s@gmail.com"
    }
    return this.customerService.create(ctx,input,"12345678")
  }
}