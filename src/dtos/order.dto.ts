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
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}