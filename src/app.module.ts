import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileModule } from './modules/upload.module';
import { AuthModule } from './modules/auth.module';
import { StaffModule } from './modules/staff.module';
import { TableModule } from './modules/table.module';
import { RawMaterialModule } from './modules/material.module';
import { CustomerModule } from './modules/customer.module';
import { ProductModule } from './modules/product.module';
import { OrderModule } from './modules/order.module';
import { PromoteModule } from './modules/promote.module';
import { MembershipModule } from './modules/membership.module';
import { ReportModule } from './modules/report.module';
import { BranchModule } from './modules/branch.module';
import { BranchStaffModule } from './modules/branchstaff.module';
import { ProductBranchModule } from './modules/product_branch.module';
import { BranchOrderModule } from './modules/branch_order.module';
import { RatingModule } from './modules/rating.module';
import { BranchMaterialModule } from './modules/branch_material.module';
import { CartModule } from './modules/cart.module';
import { VnpayModule } from './modules/vnpay.module';
import typeorm from './commons/TypeORMConfig';
import { envFiles } from './commons/Constant';
// import thêm các entity khác ở đây

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFiles,
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeorm'))
    }),
    FileModule,
    AuthModule,
    BranchModule,
    StaffModule,
    BranchStaffModule,
    TableModule,
    RawMaterialModule,
    BranchMaterialModule,
    CustomerModule,
    ProductModule,
    ProductBranchModule,
    RatingModule,
    OrderModule,
    BranchOrderModule,
    CartModule,
    PromoteModule,
    MembershipModule,
    ReportModule,
    VnpayModule,
  ],
})
export class AppModule {}
