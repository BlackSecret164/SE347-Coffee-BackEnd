import { ApiProperty } from '@nestjs/swagger';

export class ProductSizeDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'M' })
  sizeName: string;

  @ApiProperty({ example: 29000 })
  price: number;

  @ApiProperty({ example: 1 })
  productId: number;
}

export class ProductSizeResponseDto {
  @ApiProperty({ example: 'M' })
  sizeName: string;

  @ApiProperty({ example: 25000 })
  price: number;
}
