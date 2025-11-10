import { Controller, Get, Post, Param, Body, Delete, Put, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto, CreateOrderCustomerDto, UpdateOrderCustomerDto } from '../dtos/order.dto';
import { CreateOrderDetailsDto } from 'src/dtos/order-details.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';
//import { CreateFullOrderDto } from 'src/dtos/create-full-order.dto';

@ApiTags('Order')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'), RoleGuard)
// @Role([EnumRoles.ADMIN_SYSTEM])
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get('/list')
  @ApiOperation({ summary: 'Get list of all orders' })
  findAll() {
    return this.orderService.findAll();
  }

  @Get('/new')
  @ApiOperation({ summary: 'Get latest order' })
  findLatest() {
    return this.orderService.findLatest();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create order only (no details)' })
  create(@Body() dto: CreateOrderCustomerDto) {
    return this.orderService.create(dto);
  }

  @Post('/detail/:id')
  @ApiOperation({ summary: 'Add product to existing order' })
  addDetail(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateOrderDetailsDto) {
    return this.orderService.addDetail(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order by ID' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderCustomerDto) {
    return this.orderService.update(id, dto);
  }

  @Put('/complete/:id')
  @ApiOperation({ summary: 'Mark order as completed' })
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.markComplete(id);
  }

  @Put('/cancel/:id')
  @ApiOperation({ summary: 'Mark order as cancelled' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.markCancel(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order by ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }

  // -------- CUSTOMER ACCESS --------
  @Get('customer/:phone')
  getOrdersByCustomer(@Param('phone') phone: string) {
    return this.orderService.findAllByCustomerPhone(phone);
  }

  @Get('customer/:phone/:id')
  getOrderByCustomer(
    @Param('phone') phone: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.findOneByCustomerPhone(id, phone);
  }

  @Put('customer/:phone/:id/cancel')
  cancelByCustomer(
    @Param('phone') phone: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.cancelByCustomer(id, phone);
  }
}
