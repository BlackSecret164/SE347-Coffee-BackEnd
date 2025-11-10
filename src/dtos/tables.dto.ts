import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class TableDto {
  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneOrder: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bookingTime: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  seatingTime: string;

  @ApiProperty()
  @IsNumber()
  seat: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  branchId: number;
}
