import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateOrderDetailsDto } from 'src/dtos/order-details.dto';
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from 'src/dtos/order.dto';
import { EnumRoles } from 'src/enums/role.enum';
import { Role } from 'src/guards/RoleDecorator';
import { RoleGuard } from 'src/guards/RoleGuard';
import { BranchOrderService } from 'src/services/branch_order.service';

@ApiTags('Branch Order')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Controller('branch-order')
export class BranchOrderController {
  constructor(private readonly branchOrderService: BranchOrderService) {}

  @Get('/list')
  @ApiOperation({ summary: 'Get list of orders in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  findAll(@Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.findAllByBranch(branchId);
  }

  @Get('/new')
  @ApiOperation({ summary: 'Get latest order in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  findLatest(@Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.findLatestInBranch(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail by ID in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.findOneByBranch(id, branchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new order in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.create(dto, branchId);
  }

  @Put('status/:id')
  @ApiOperation({ summary: 'Update order status and assign staff' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    const branchId = req.user.branchId;
    console.log(
      `[BranchOrder] Update Status - Order: ${id}, Branch: ${branchId}`,
    );
    // Truyền cả staffId và staffName vào service (uưu tiên staffId)
    return this.branchOrderService.updateStatus(
      id,
      dto.status,
      branchId,
      dto.staffId,
      dto.staffName,
    );
  }

  @Put('/complete/:id')
  @ApiOperation({ summary: 'Mark order as completed in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  complete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.markCompleteInBranch(id, branchId);
  }

  @Put('/cancel/:id')
  @ApiOperation({ summary: 'Cancel order in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.markCancelInBranch(id, branchId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
    @Req() req: Request,
  ) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.updateInBranch(id, dto, branchId);
  }

  @Post('/detail/:id')
  @ApiOperation({ summary: 'Add order details (products) in branch' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  addDetail(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateOrderDetailsDto,
    @Req() req: Request,
  ) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.addDetailInBranch(id, dto, branchId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order by ID' })
  @Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.branchOrderService.remove(id, branchId);
  }
}
