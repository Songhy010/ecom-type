import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { ProductsController } from './plugins/rest-api/product/products.controller';
import { CustomerController } from './plugins/rest-api/customer/customer.controller';
import { AuthController } from './plugins/rest-api/customer/auth.controller';

@VendurePlugin({
  imports: [PluginCommonModule],
  controllers: [ProductsController,CustomerController,AuthController],
})
export class RestPlugin {}