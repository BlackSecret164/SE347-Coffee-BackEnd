import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ProductBranchService } from '../services/product_branch.service';
import { CreateProductBranchDto, UpdateProductBranchStatusDto } from '../dtos/product_branch.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';

@ApiTags('ProductBranch')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Controller('product-branch')
export class ProductBranchController {
  constructor(private readonly productBranchService: ProductBranchService) {}

  @Get('/list')
  @ApiOperation({ summary: 'Get product availability in branches' })
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  findAll(@Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.productBranchService.findAll(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product branch by ID' })
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.productBranchService.findOne(id, branchId);
  }

  /*@Post()
  @ApiOperation({ summary: 'Create product availability in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  create(@Body() dto: CreateProductBranchDto, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.productBranchService.create(dto, branchId);
  }*/

  @Put('/available/:id')
  @ApiOperation({ summary: 'Update availability of product in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductBranchStatusDto,
    @Req() req: Request,
  ) {
    const branchId = req.user['branchId'];
    return this.productBranchService.updateAvailability(id, dto, branchId);
  }

  /*@Delete(':id')
  @ApiOperation({ summary: 'Delete product availability from branch' })
  @Role([EnumRoles.ADMIN_BRAND])
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.productBranchService.remove(id, branchId);
  }*/
}
