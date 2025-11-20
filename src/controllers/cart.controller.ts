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
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    @ApiQuery({ name: 'phoneCustomer', required: false })
    @ApiQuery({ name: 'sessionId', required: false })
    async findAll(
        @Query('phoneCustomer') phoneCustomer?: string,
        @Query('sessionId') sessionId?: string,
    ) {
        return this.cartService.findAll(phoneCustomer, sessionId);
    }

    @Post()
    async create(@Body() dto: CreateCartItemDto) {
        return this.cartService.create(dto);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() dto: UpdateCartItemDto) {
        return this.cartService.updateQuantity(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.cartService.remove(id);
    }

    @Delete()
    @ApiQuery({ name: 'phoneCustomer', required: false })
    @ApiQuery({ name: 'sessionId', required: false })
    async clearCart(
        @Query('phoneCustomer') phoneCustomer?: string,
        @Query('sessionId') sessionId?: string,
    ) {
        if (!phoneCustomer && !sessionId) {
            throw new BadRequestException('phoneCustomer or sessionId is required');
        }

        if (phoneCustomer) {
            return this.cartService.clearCartByCustomer(phoneCustomer);
        }
        return this.cartService.clearCartBySession(sessionId);
    }

    @Post('migrate')
    @ApiQuery({ name: 'sessionId', required: true })
    @ApiQuery({ name: 'phoneCustomer', required: true })
    async migrate(
        @Query('sessionId') sessionId: string,
        @Query('phoneCustomer') phoneCustomer: string,
    ) {
        if (!sessionId || !phoneCustomer) {
            throw new BadRequestException('sessionId and phoneCustomer are required');
        }
        return this.cartService.migrateSessionToCustomer(sessionId, phoneCustomer);
    }
}
