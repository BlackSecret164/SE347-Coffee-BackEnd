import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty()
  @IsInt()
  staffId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action: string;
}
