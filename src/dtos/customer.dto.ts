import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber, IsInt } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty()
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  total: number;

  @ApiProperty()
  @IsOptional()
  registrationDate: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  rank: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ example: 'https://image.url' })
  image: string;
}

export class UpdateCustomerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ example: 'https://image.url' })
  image: string;
}
