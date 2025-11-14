import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBranchMaterialDto {
  @ApiProperty()
  @IsInt()
  rawMaterialId: number;

  @ApiProperty()
  @IsInt()
  branchId: number;

  @ApiProperty()
  @IsInt()
  quantityImported: number;

  @ApiProperty()
  @IsInt()
  quantityStock: number;

  @ApiProperty()
  @IsDateString()
  importDate: string;

  @ApiProperty()
  @IsDateString()
  expiryDate: string;
}

export class UpdateBranchMaterialDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  quantityImported?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  quantityStock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  importDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
