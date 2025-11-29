/*import { Controller, Get } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('system')
  getSystemReport() {
    return this.reportService.getSystemReport();
  }
}*/

import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('report')
/*@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)*/
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Get('system')
  //@Role([EnumRoles.ADMIN_SYSTEM])
  @ApiOperation({ summary: 'Thống kê toàn hệ thống' })
  async getSystemReport() {
    return this.reportService.getSystemReport();
  }

  @Get('branch/:branchId')
  //@Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  @ApiOperation({ summary: 'Thống kê theo chi nhánh' })
  @ApiParam({ name: 'branchId', type: Number })
  async getBranchReport(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.reportService.getBranchReport(branchId);
  }

  @Get('/monthly-branch-compare')
  async getBranchMonthlyComparison() {
    return this.reportService.getBranchMonthlyComparison();
  }

}
