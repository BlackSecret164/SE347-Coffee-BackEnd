import { Controller, Get, Post, Put, Delete, Body, Param, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { BranchStaffService } from 'src/services/branchstaff.service';
import { StaffDto, UpdateStaffDto } from 'src/dtos/staff.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserModal } from 'src/models/User';

@ApiTags('branch-staff')
@Controller('branch-staff')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class BranchStaffController {
  constructor(private readonly branchStaffService: BranchStaffService) {}

  @Get('/list')
  @Role([EnumRoles.ADMIN_BRAND])
  async findAll(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserModal;
    return res.status(HttpStatus.OK).json(await this.branchStaffService.findAll(user.branchId));
  }

  @Post('/')
  @Role([EnumRoles.ADMIN_BRAND])
  async create(@Req() req: Request, @Res() res: Response, @Body() dto: StaffDto) {
    const user = req.user as UserModal;
    return res.status(HttpStatus.CREATED).json(await this.branchStaffService.create(dto, user.branchId));
  }

  @Get('/:id')
  @Role([EnumRoles.ADMIN_BRAND])
  async findById(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    const user = req.user as UserModal;
    return res.status(HttpStatus.OK).json(await this.branchStaffService.findOneByBranch(user.branchId, id));
  }

  @Put('/:id')
  @Role([EnumRoles.ADMIN_BRAND])
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
    @Body() dto: UpdateStaffDto,
  ) {
    const user = req.user as UserModal;
    return res.status(HttpStatus.OK).json(await this.branchStaffService.update(id, dto, user.branchId));
  }

  @Delete('/:id')
  @Role([EnumRoles.ADMIN_BRAND])
  async remove(@Req() req: Request, @Res() res: Response, @Param('id') id: number) {
    const user = req.user as UserModal;
    return res.status(HttpStatus.OK).json(await this.branchStaffService.remove(id, user.branchId));
  }
}
