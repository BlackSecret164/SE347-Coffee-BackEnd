import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt } from 'class-validator';

export class CreateProductBranchDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty()
  @IsInt()
  branchId: number;

  @ApiProperty()
  @IsBoolean()
  available: boolean;
}

export class UpdateProductBranchStatusDto {
  @ApiProperty()
  @IsBoolean()
  available: boolean;
}
