import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsPositive, IsOptional } from 'class-validator';

export class CreateMembershipDto {
  @ApiProperty()
  @IsString()
  rank: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  mPrice: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  discount: number;
}
