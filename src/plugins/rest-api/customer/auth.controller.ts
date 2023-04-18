import { Controller, Get, Post, UseFilters, HttpException, HttpStatus, UseGuards} from '@nestjs/common';
import { Ctx, 
  ExternalAuthenticationService,
  CustomerService,
  UserService, 
  RequestContext, 
  AuthService, 
  SessionService, CachedSession } from '@vendure/core'; 
import { CreateCustomerInput } from '@vendure/common/lib/generated-types';
import { JwtService } from '@nestjs/jwt';
import { CustomExceptionFilter } from '../util/custom-exception.filter';
import Utils from '../util/util'
import {Payload} from '../util/constant'
import { AuthGuard } from '../util/auth.guard';


@Controller('rest-api/auth')
export class AuthController {
  constructor(
    private externalAuthenticationService: ExternalAuthenticationService,
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
      const user = await this.userService.getUserByEmailAddress(ctx,param.identifier)
      
      if(!user){
        throw new HttpException('NOT_FOUND',HttpStatus.NOT_FOUND);
      }

      const verify = await this.authService.verifyUserPassword(ctx,user!.id,param.password)
      if(verify === true){
        const session = await this.sessionService.createNewAuthenticatedSession(ctx,user!,"native")
        const payload = { identifier: user?.identifier, sub: user?.id, ses: session?.token};
        const jwt = await this.jwtService.signAsync(payload)
  
        return Utils.response({
          access_token:jwt,
          expire_in:"24h"
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
      
      const payload = { identifier: session?.user?.identifier, sub: session?.user?.id,ses:session?.token};
      const jwt = await this.jwtService.signAsync(payload)

      return Utils.response({
        access_token:jwt,
        expire_in:"24h"
      },HttpStatus.OK);
    } catch (error) {
      throw error
    }
  }

  @Post('register')
  @UseFilters(new CustomExceptionFilter)
  async register(@Ctx() ctx: RequestContext){
    try {
      const param = ctx.req?.body
      //console.log(param)
      if(!param.identifier || !param.password){
        throw new HttpException("BAD_REQUEST",HttpStatus.BAD_REQUEST)
      }
      const user = await this.userService.getUserByEmailAddress(ctx,param.identifier)
      if(user){
        throw new HttpException("CONFLICT",HttpStatus.CONFLICT)
      }
      let input : CreateCustomerInput = {
        title : "",
        firstName : "",
        lastName : "",
        phoneNumber:"",
        emailAddress:param.identifier
      }
      const customer = await this.customerService.create(ctx,input,param.password) as any
      const jwt = await Utils.generateToken(ctx,
        this.sessionService,
        this.userService,
        this.jwtService,
        customer.user.identifier,
        'native')
      return Utils.response({ 
        access_token:jwt,
        expire_in:"24h"}
        ,HttpStatus.OK)
    } catch (error) {
      throw error
    }
  }

  @Post('social_login')
  @UseFilters(new CustomExceptionFilter)
  async socialLogin(@Ctx() ctx :RequestContext){
    try {
      const param = ctx.req?.body
      let existingUser = await this.externalAuthenticationService.findCustomerUser(ctx, param.method, param.identifier);
      if(existingUser){
        const jwt = await Utils.generateToken(ctx,
          this.sessionService,
          this.userService,
          this.jwtService,
          existingUser.identifier,
          param.method)
        return Utils.response({ 
          access_token: jwt,
          expire_in:"24h"}
          ,HttpStatus.OK)
      }
      existingUser = await this.externalAuthenticationService.createCustomerAndUser(ctx, {
        strategy: param.method,
        externalIdentifier: param.identifier,
        verified: true,
        emailAddress: param.identifier,
        firstName: "",
        lastName: "",
      });
      const jwt = await Utils.generateToken(ctx,
        this.sessionService,
        this.userService,
        this.jwtService,
        existingUser.identifier,
        param.method)
      return Utils.response({ 
        access_token:jwt,
        expire_in:"24h"}
        ,HttpStatus.OK)
    } catch (error) {
      throw error
    }
  }

  @Post('social_connect')
  @UseFilters(new CustomExceptionFilter)
  @UseGuards(AuthGuard)
  async connectSocial(@Ctx() ctx :RequestContext) {
    try {
      const tokenPayload = ctx.req as any
      const param = ctx.req?.body
      const existingUser = await this.externalAuthenticationService.findCustomerUser(ctx, param.method, param.identifier);
      if(existingUser){
        throw new HttpException("CONFLICT",HttpStatus.CONFLICT)
      }
      const user = await this.externalAuthenticationService.createCustomerAndUser(ctx, {
        strategy: param.method,
        externalIdentifier: param.identifier,
        verified: true,
        emailAddress: tokenPayload.user.identifier,
        firstName: "",
        lastName: "",
      });

      return Utils.response(user,HttpStatus.OK)
    } catch (error) {
      throw error
    }
  }
}