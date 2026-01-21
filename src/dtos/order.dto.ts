import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  phoneCustomer: string;

  @ApiProperty()
  @IsString()
  serviceType: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  totalPrice: number;

  @ApiProperty()
  @IsInt()
  staffID: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  tableID?: number;

  @ApiProperty()
  @IsDateString()
  orderDate: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  productIDs: number[];

  @ApiProperty()
  @IsInt()
  branchId: number;
}

export class UpdateOrderDto {
  @ApiProperty()
  @IsString()
  phoneCustomer: string;

  @ApiProperty()
  @IsString()
  serviceType: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  tableID?: number;

  @ApiProperty()
  @IsDateString()
  orderDate: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  paymentMethod: string;

  @ApiProperty()
  @IsString()
  paymentStatus: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;
}

export class CreateOrderCustomerDto {
  @ApiProperty()
  @IsString()
  phoneCustomer: string;

  @ApiProperty()
  @IsString()
  serviceType: string;

  @ApiProperty()
  @IsDateString()
  orderDate: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  productIDs: number[];

  @ApiProperty()
  @IsInt()
  branchId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;
}

export class UpdateOrderCustomerDto {
  @ApiProperty()
  @IsString()
  phoneCustomer: string;

  @ApiProperty()
  @IsString()
  serviceType: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  totalPrice: number;

  @ApiProperty()
  @IsDateString()
  orderDate: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  paymentMethod: string;

  @ApiProperty()
  @IsString()
  paymentStatus: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;
}

export enum OrderStatus {
  DRAFT = 'Nháp',
  PENDING = 'Chờ xác nhận',
  CONFIRMED = 'Đã xác nhận',
  PREPARING = 'Đang chuẩn bị',
  READY = 'Sẵn sàng',
  DELIVERING = 'Đang giao',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Đã hủy',
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ 
    required: false, 
    description: 'ID nhân viên xử lý đơn hàng (uưu tiên dùng nếu có)' 
  })
  @IsOptional()
  @IsInt()
  staffId?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Tên nhân viên xử lý đơn hàng (dùng nếu không có staffId)' 
  })
  @IsOptional()
  @IsString()
  staffName?: string;
}