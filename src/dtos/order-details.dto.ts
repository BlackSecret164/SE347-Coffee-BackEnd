import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOrderDetailsDto {
  @ApiProperty()
  @IsNumber()
  orderID: number;

  @ApiProperty()
  @IsNumber()
  productID: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  size: string;

  @ApiProperty()
  @IsString()
  mood: string;
}

export class CreateOrderBranchDetailsDto {
  @ApiProperty()
  @IsNumber()
  productBranchID: number; // ID thực tế frontend gửi

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  size: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mood?: string; // cho phép null
}

