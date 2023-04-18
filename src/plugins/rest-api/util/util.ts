import { HttpStatus} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Ctx,RequestContext,UserService,SessionService, User } from '@vendure/core'; 
export default class Utils {
    static response(data: any,code: HttpStatus) { 
        return {
            code:code,
            data:data
        } 
    }

    static async generateToken(@Ctx() ctx:RequestContext, 
    sessionService: SessionService,
    userService: UserService, 
    jwtService: JwtService, 
    identifier: string,
    method: string){
       const user = await userService.getUserByEmailAddress(ctx,identifier)
       if(!user){
        return "NOT_FOUND"
       }
       const sess = await sessionService.createNewAuthenticatedSession(ctx,user!,method)
       const payload = { identifier: user?.identifier, sub: user?.id, ses: sess?.token};
       return await jwtService.signAsync(payload);
    }

    
}