import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class PromoteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  promoteType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endAt?: Date;
}
