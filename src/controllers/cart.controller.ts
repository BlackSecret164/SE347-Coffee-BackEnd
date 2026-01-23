import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from '../dtos/cart.dto';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiQuery({ name: 'phoneCustomer', required: true })
  async findAll(@Query('phoneCustomer') phoneCustomer: string) {
    if (!phoneCustomer) {
      throw new BadRequestException('phoneCustomer is required');
    }
    return this.cartService.findAll(phoneCustomer);
  }

  // Thêm endpoint để lấy branchId của giỏ hàng hiện tại
  @Get('branch')
  @ApiOperation({ summary: 'Get branch ID of current cart' })
  @ApiQuery({ name: 'phoneCustomer', required: true })
  async getCartBranch(@Query('phoneCustomer') phoneCustomer: string) {
    if (!phoneCustomer) {
      throw new BadRequestException('phoneCustomer is required');
    }
    const branchId = await this.cartService.getCartBranchId(phoneCustomer);
    return { branchId };
  }

  @Post()
  async create(@Body() dto: CreateCartItemDto) {
    return this.cartService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateCartItemDto) {
    return this.cartService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.cartService.remove(id);
  }

  @Delete()
  @ApiQuery({ name: 'phoneCustomer', required: true })
  async clearCart(@Query('phoneCustomer') phoneCustomer: string) {
    if (!phoneCustomer) {
      throw new BadRequestException('phoneCustomer is required');
    }
    return this.cartService.clearCartByCustomer(phoneCustomer);
  }
}
