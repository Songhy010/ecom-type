import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    UseFilters,
    HttpException, HttpStatus
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
import { CustomExceptionFilter } from './custom-exception.filter';
import { SessionService } from '@vendure/core';
  
  @Injectable()

  export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    @UseFilters(new CustomExceptionFilter)
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload = await this.jwtService.verifyAsync(
          token,
          {
            secret: process.env.SECRET_JWT
          }
        );
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        request['user'] = payload;
      } catch {
       // const payload = await this.jwtService.decode(token)
        //const ses = payload.ses
        //console.log(ses)
        throw new HttpException('UNAUTHORIZED',HttpStatus.UNAUTHORIZED);
      }
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }