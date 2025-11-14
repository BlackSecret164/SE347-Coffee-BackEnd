import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateProductMaterialDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  materialId: number;

  @ApiProperty()
  @IsNumber()
  materialQuantity: number;
}

export class ProductMaterialInputDto {
  @ApiProperty()
  @IsNumber()
  materialId: number;

  @ApiProperty()
  @IsNumber()
  materialQuantity: number;
}
