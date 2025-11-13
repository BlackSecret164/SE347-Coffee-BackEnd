// dtos/cart.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class AddToCartDto {
  @ApiProperty() @IsNumber() productId: number;
  @ApiProperty() @IsNumber() quantity: number;
  @ApiProperty() @IsString() size: string;
  @ApiProperty() @IsString() mood: string;
  @ApiProperty() @IsString() phone: string;
}

export class CreateCartItemDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsString()
  size: string;

  @ApiProperty()
  @IsString()
  mood: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneCustomer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;
}


export class UpdateCartItemDto {
  @ApiProperty() @IsNumber() quantity: number;

  @ApiProperty()
  @IsString()
  size: string;

  @ApiProperty()
  @IsString()
  mood: string;
}
