import { Controller, Get, Post, UseFilters, HttpException, HttpStatus} from '@nestjs/common';
import { Ctx, CustomerService,UserService, RequestContext, AuthService } from '@vendure/core'; 
import { CreateCustomerInput } from '@vendure/common/lib/generated-types';
import { JwtService } from '@nestjs/jwt';
import { CustomExceptionFilter } from '../util/custom-exception.filter';
import Utils from '../util/util'


@Controller('rest-api/auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private customerService: CustomerService,
    private userService: UserService) {}

  @Get('login')
  @UseFilters(new CustomExceptionFilter())
  async login(@Ctx() ctx: RequestContext){
    try {
      //console.log(ctx.req?.body.username);
      var param = ctx.req?.body
      const jwt = await this.jwtService.signAsync({id:param.username})

      return Utils.response({
        access_token:jwt,
        refresh_token:"comming soon",
        expire_in:"comming soon"
      },HttpStatus.OK);
    } catch (error) {
      throw new HttpException('unexpected error',HttpStatus.NOT_FOUND);
    }
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