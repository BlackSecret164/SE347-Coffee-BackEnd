import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsPhoneNumber, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  managerId?: number;
}
