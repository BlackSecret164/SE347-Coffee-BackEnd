import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, IsInt, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty()
  @IsString()
  phoneCustomer: string;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  star: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  orderId?: number;
}

export class CustomerInfo {
  @ApiProperty()
  phone: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  rank: string;
}

export class ProductInfo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class RatingResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  star: number;

  @ApiProperty({ type: () => CustomerInfo })
  customer: CustomerInfo;

  @ApiProperty({ type: () => ProductInfo })
  product: ProductInfo;
}

export class UpdateRatingDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  star: number;
}

export class ListRatingResponseDto {
  id: number;
  description: string;
  star: number;
  createdAt: Date;
  customer: {
    phone: string;
    name: string;
    rank: string;
  };
  product: {
    id: number;
    name: string;
    image: string;
  };
}

