import { HttpStatus} from '@nestjs/common';
export default class Utils {
    static response(data: any,code: HttpStatus) { 
        return {
            code:code,
            data:data
        } 
    }
}