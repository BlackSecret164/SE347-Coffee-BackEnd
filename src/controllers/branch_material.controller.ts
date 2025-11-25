import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { BranchMaterialService } from '../services/branch_material.service';
import { CreateBranchMaterialDto, UpdateBranchMaterialDto } from '../dtos/branch_material.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'src/guards/RoleDecorator';
import { UseGuards, Req } from '@nestjs/common';
import { RoleGuard } from 'src/guards/RoleGuard';
import { EnumRoles } from 'src/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
@Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
@ApiTags('Branch Material')
@Controller('branch-material')
export class BranchMaterialController {
    constructor(private readonly branchMaterialService: BranchMaterialService) { }

    @Get('list')
    getAll(@Req() req) {
        return this.branchMaterialService.findByBranchId(req.user.branchId);
    }

    @Get(':id')
    getOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.branchMaterialService.findOneByIdForBranch(req.user.branchId, id);
    }

    // @Post()
    // create(@Req() req, @Body() dto: CreateBranchMaterialDto) {
    //     return this.branchMaterialService.createForBranch(req.user.branchId, dto);
    // }

    @Put(':id')
    update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBranchMaterialDto) {
        return this.branchMaterialService.updateForBranch(req.user.branchId, id, dto);
    }

    // @Delete(':id')
    // remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    //     return this.branchMaterialService.removeForBranch(req.user.branchId, id);
    // }
}
