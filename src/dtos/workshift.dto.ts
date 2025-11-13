import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WorkShiftDto {
  @ApiProperty()
  @IsString()
  shiftName: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;
}
