import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { ProductsController } from './plugins/rest-api/product/products.controller';
import { CustomerController } from './plugins/rest-api/customer/customer.controller';
import { AuthController } from './plugins/rest-api/customer/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';

@VendurePlugin({
  imports: [PluginCommonModule,JwtModule.register({
    secret:process.env.SECRET_JWT,
    signOptions:{expiresIn:process.env.EXPIRER_JWT}
  })],
  controllers: [ProductsController,CustomerController,AuthController],
})
export class RestPlugin {}