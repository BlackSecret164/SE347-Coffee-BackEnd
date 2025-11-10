import { Controller, Get, Post, Param, Body, Delete, Put, UseGuards } from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { StaffDto, UpdateStaffDto, UpdateStaffBranchIdDto } from 'src/dtos/staff.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';

@ApiTags('Staff')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'), RoleGuard)
// @Role([EnumRoles.ADMIN_SYSTEM])
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('/list')
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.staffService.findOne(id);
  }

  @Post()
  create(@Body() staffDto: StaffDto) {
    return this.staffService.create(staffDto);
  }

  @Put(':id')
  @ApiBody({ type: UpdateStaffDto })
  update(@Param('id') id: number, @Body() updatestaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updatestaffDto);
  }

  @Put('staffbranch/:id')
  @ApiBody({ type: UpdateStaffBranchIdDto })
  updateBranchId(@Param('id') id: number, @Body() updatestaffBranchIdDto: UpdateStaffBranchIdDto) {
    return this.staffService.updateBranchId(id, updatestaffBranchIdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.staffService.remove(id);
  }
}
