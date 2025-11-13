import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CouponDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  promoteId?: number;
}
