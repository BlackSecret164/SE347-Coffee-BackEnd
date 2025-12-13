// dtos/cart.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

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

  @ApiProperty()
  @IsString()
  phoneCustomer: string;
}

export class UpdateCartItemDto {
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
