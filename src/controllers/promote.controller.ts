import { Controller, Get, Post, Param, Body, Delete, Put, NotFoundException, UseGuards, Req, Query } from '@nestjs/common';
import { PromoteService } from '../services/promote.service';
import { PromoteDto } from '../dtos/promote.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CouponService } from '../services/coupon.service';
import { CouponDto } from '../dtos/coupon.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';

@ApiTags('Promote')
@Controller('promote')
export class PromoteController {
  constructor(
    private readonly promoteService: PromoteService,
    private readonly couponService: CouponService,
  ) {}

  // --- PROMOTE ---

  @Get('/list')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  @ApiOperation({ summary: 'Get list of promotions (filtered by role and branch)' })
  @ApiResponse({ status: 200, description: 'List of promotions' })
  findAll(@Req() req: any) {
    const userRole = req.user?.role;
    const branchId = req.user?.branchId;
    return this.promoteService.findAll(userRole, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promotion by ID' })
  @ApiResponse({ status: 200, description: 'Promotion found by ID' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async findOne(@Param('id') id: number) {
    const promote = await this.promoteService.findOne(id);
    if (!promote) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promote;
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  create(@Body() dto: PromoteDto, @Req() req: any) {
    const userRole = req.user?.role;
    const branchId = req.user?.branchId;
    return this.promoteService.create(dto, userRole, branchId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  @ApiOperation({ summary: 'Update a promotion by ID' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot edit shared promotion' })
  async update(@Param('id') id: number, @Body() dto: PromoteDto, @Req() req: any) {
    const userRole = req.user?.role;
    const branchId = req.user?.branchId;
    return await this.promoteService.update(id, dto, userRole, branchId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  @ApiOperation({ summary: 'Delete a promotion by ID' })
  @ApiResponse({ status: 204, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete shared promotion' })
  async remove(@Param('id') id: number, @Req() req: any) {
    const userRole = req.user?.role;
    const branchId = req.user?.branchId;
    await this.promoteService.remove(id, userRole, branchId);
    return;
  }

  // --- COUPON ---

  @Get('/coupon/check')
  @ApiOperation({ summary: 'Check coupon by code (public - no auth required)' })
  @ApiResponse({ status: 200, description: 'Coupon is valid' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 400, description: 'Coupon is expired or inactive' })
  async checkCoupon(@Query('code') code: string, @Query('branchId') branchId?: number) {
    return await this.couponService.findByCode(code, branchId);
  }

  @Get('/coupon/list')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  @ApiOperation({ summary: 'Get list of coupons (filtered by role and branch)' })
  @ApiResponse({ status: 200, description: 'List of coupons' })
  findAllCoupons(@Req() req: any) {
    const userRole = req.user?.role;
    const branchId = req.user?.branchId;
    return this.couponService.findAll(userRole, branchId);
  }

  @Get('/coupon/:id')
  @ApiOperation({ summary: 'Get a coupon by ID' })
  @ApiResponse({ status: 200, description: 'Coupon found by ID' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async findCoupon(@Param('id') id: number) {
    const coupon = await this.couponService.findOne(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  @Post('/coupon')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  createCoupon(@Body() dto: CouponDto, @Req() req: any) {
    const userRole = req.user?.role;
    const branchId = req.user?.branchId;
    return this.couponService.create(dto, userRole, branchId);
  }

  @Put('/coupon/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  @ApiOperation({ summary: 'Update a coupon by ID' })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot edit shared coupon' })
  async updateCoupon(@Param('id') id: number, @Body() dto: CouponDto, @Req() req: any) {
    const userRole = req.user?.role;
    const branchId = req.user?.branchId;
    return await this.couponService.update(id, dto, userRole, branchId);
  }

  @Delete('/coupon/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  @ApiOperation({ summary: 'Delete a coupon by ID' })
  @ApiResponse({ status: 204, description: 'Coupon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete shared coupon' })
  async removeCoupon(@Param('id') id: number, @Req() req: any) {
    const userRole = req.user?.role;
    const branchId = req.user?.branchId;
    await this.couponService.remove(id, userRole, branchId);
    return;
  }
}
