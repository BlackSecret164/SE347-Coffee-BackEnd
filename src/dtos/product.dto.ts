import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ProductSizeResponseDto } from './product_size.dto';
import { Type } from 'class-transformer';
import { ProductMaterial } from 'src/entities/product-material.entity';
import { ProductMaterialInputDto } from './product-material.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Cà phê sữa' })
  name: string;

  @ApiProperty({ example: 'coffee' })
  category: string;

  @ApiProperty({ example: 'https://image.url' })
  image: string;

  @ApiProperty({ example: 'Cà phê pha với sữa đặc nguyên chất' })
  description: string;

  @ApiProperty({ example: true })
  available: boolean;

  @ApiProperty({ example: true })
  hot: boolean;

  @ApiProperty({ example: true })
  cold: boolean;

  @ApiProperty({ example: false })
  isPopular: boolean;

  @ApiProperty({ example: true })
  isNew: boolean;

  @ApiProperty({ type: [ProductSizeResponseDto] })
  sizes: ProductSizeResponseDto[];

  @ApiProperty({ type: [ProductMaterialInputDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMaterialInputDto)
  @IsOptional()
  productMaterials?: ProductMaterialInputDto[];
}

export class UpdateStatusDto{
  @ApiProperty()
  @IsBoolean()
  available: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    type: [ProductSizeResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSizeResponseDto)
  sizes: ProductSizeResponseDto[];

  @ApiProperty({ type: [ProductMaterialInputDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMaterialInputDto)
  @IsOptional()
  productMaterials?: ProductMaterialInputDto[];
}

export class ProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Cà phê sữa' })
  name: string;

  @ApiProperty({ example: 'coffee' })
  category: string;

  @ApiProperty({ example: 'https://image.url' })
  image: string;

  @ApiProperty({ example: 'Cà phê pha với sữa đặc nguyên chất' })
  description: string;

  @ApiProperty({ example: true })
  available: boolean;

  @ApiProperty({ example: true })
  hot: boolean;

  @ApiProperty({ example: true })
  cold: boolean;

  @ApiProperty({ example: false })
  isPopular: boolean;

  @ApiProperty({ example: true })
  isNew: boolean;

  @ApiProperty({ type: [ProductSizeResponseDto] })
  sizes: ProductSizeResponseDto[];

  @ApiProperty({ type: [ProductMaterialInputDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMaterialInputDto)
  @IsOptional()
  productMaterials?: ProductMaterialInputDto[];
}
