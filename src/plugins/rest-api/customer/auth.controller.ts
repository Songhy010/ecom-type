import { Controller,Request, Get, Post, UseFilters, HttpException, HttpStatus, UseGuards} from '@nestjs/common';
import { Ctx, CustomerService,UserService, RequestContext, AuthService, SessionService, CachedSession, AuthGuard } from '@vendure/core'; 
import { CreateCustomerInput } from '@vendure/common/lib/generated-types';
import { JwtService } from '@nestjs/jwt';
import { CustomExceptionFilter } from '../util/custom-exception.filter';
import Utils from '../util/util'
import {Payload,RequestPayload} from '../util/constant'


@Controller('rest-api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private jwtService: JwtService,
    private customerService: CustomerService,
    private userService: UserService) {}

  @Get('login')
  @UseFilters(new CustomExceptionFilter)
  async login(@Ctx() ctx: RequestContext){
    try {
      var param = ctx.req?.body
      const user = await this.userService.getUserByEmailAddress(ctx,param.username)
      
      if(!user){
        throw new HttpException('NOT_FOUND',HttpStatus.NOT_FOUND);
      }

      const verify = await this.authService.verifyUserPassword(ctx,user!.id,param.password)
      if(verify === true){
        const session = await this.sessionService.createNewAuthenticatedSession(ctx,user!,"native")
        const payload = { username: user?.identifier, sub: user?.id,ses:session?.token};
        const jwt = await this.jwtService.signAsync(payload)
  
        return Utils.response({
          access_token:jwt,
          expire_in:"comming soon"
        },HttpStatus.OK);
      }else{
        throw new HttpException('NOT_FOUND',HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw error
    }
  }

  @Post('refresh_token')
  @UseFilters(new CustomExceptionFilter)
  async refreshToken(@Ctx() ctx: RequestContext){
    try {
      const [type, token] = ctx.req?.headers.authorization?.split(' ') ?? []
      const jwtDecode = this.jwtService.decode(token) as Payload
      const session = await this.sessionService.getSessionFromToken(jwtDecode.ses) as CachedSession
      var currentDate = new Date();
      if(currentDate > session?.expires!){
        throw new HttpException('UNAUTHORIZED',HttpStatus.UNAUTHORIZED);
      }
      
      const payload = { username: session?.user?.identifier, sub: session?.user?.id,ses:session?.token};
      const jwt = await this.jwtService.signAsync(payload)

      return Utils.response({
        payload:jwtDecode,
        access_token:jwt,
        expire_in:"comming soon"
      },HttpStatus.OK);
    } catch (error) {
      throw error
    }
  }



  @Post('add_auth_method')
  @UseFilters(new CustomExceptionFilter)
  @UseGuards(AuthGuard)
  getProfile(@Ctx() ctx :RequestContext) {
    try {
      const req = ctx.req as any
      return req.user
    } catch (error) {
      throw error
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