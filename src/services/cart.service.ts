// services/cart.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart_item.entity';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { ProductSize } from '../entities/product_size.entity';
import { AddToCartDto, UpdateCartItemDto, CreateCartItemDto } from '../dtos/cart.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
        @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(Product) private productRepo: Repository<Product>,
        @InjectRepository(ProductSize) private productSizeRepo: Repository<ProductSize>,
    ) { }

    async findAll(phoneCustomer?: string, sessionId?: string) {
        const where: any = {};
        if (phoneCustomer) where.phoneCustomer = phoneCustomer;
        else if (sessionId) where.sessionId = sessionId;
        else throw new BadRequestException('phoneCustomer or sessionId is required');

        const items = await this.cartItemRepo.find({ where, relations: ['product'] });

        const result = [];

        for (const item of items) {
            const productSize = await this.productSizeRepo.findOne({
                where: { product: { id: item.product.id }, sizeName: item.size }
            });

            result.push({
                id: item.id,
                quantity: item.quantity,
                size: item.size,
                mood: item.mood,
                productId: item.product.id,
                name: item.product.name,
                image: item.product.image,
                price: productSize?.price ?? 0
            });
        }

        return result;
    }

    async create(dto: CreateCartItemDto) {
        const product = await this.productRepo.findOne({ where: { id: dto.productId } });
        if (!product) throw new NotFoundException('Product not found');

        if (!dto.phoneCustomer && !dto.sessionId) {
            throw new BadRequestException('Either phoneCustomer or sessionId is required');
        }

        // Kiểm tra xem đã tồn tại cart item chưa
        const existingItem = await this.cartItemRepo.findOne({
            where: [
                { phoneCustomer: dto.phoneCustomer, product: { id: dto.productId }, size: dto.size, mood: dto.mood },
                { sessionId: dto.sessionId, product: { id: dto.productId }, size: dto.size, mood: dto.mood }
            ],
            relations: ['product']
        });

        if (existingItem) {
            existingItem.quantity += dto.quantity;
            return this.cartItemRepo.save(existingItem);
        }

        const cartItem = this.cartItemRepo.create({
            quantity: dto.quantity,
            size: dto.size,
            mood: dto.mood,
            sessionId: dto.sessionId || null,
            phoneCustomer: dto.phoneCustomer || null,
            product
        });

        return this.cartItemRepo.save(cartItem);
    }

    async migrateSessionToCustomer(sessionId: string, phoneCustomer: string) {
        // Lấy các cart items theo session
        const sessionCartItems = await this.cartItemRepo.find({
            where: { sessionId },
            relations: ['product'],
        });

        // Lấy cart items theo user
        const userCartItems = await this.cartItemRepo.find({
            where: { phoneCustomer },
            relations: ['product'],
        });

        for (const item of sessionCartItems) {
            // Tìm cart item trùng trong user cart (productId, size, mood)
            const matched = userCartItems.find(
                c =>
                    c.productId === item.productId &&
                    c.size === item.size &&
                    c.mood === item.mood
            );

            if (matched) {
                // Nếu đã có, cộng dồn số lượng và xóa cart item guest
                matched.quantity += item.quantity;
                await this.cartItemRepo.save(matched);
                await this.cartItemRepo.delete(item.id);
            } else {
                // Nếu chưa có, chuyển sang user, bỏ sessionId
                item.phoneCustomer = phoneCustomer;
                item.sessionId = null;
                await this.cartItemRepo.save(item);
            }
        }

        return { message: 'Cart migrated' };
    }

    async updateQuantity(id: number, dto: UpdateCartItemDto) {
        const item = await this.cartRepo.findOne({ where: { id } });
        if (!item) throw new NotFoundException('Cart item not found');

        item.quantity = dto.quantity;
        item.size = dto.size;
        item.mood = dto.mood;
        return this.cartRepo.save(item);
    }

    async remove(id: number) {
        const result = await this.cartRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Cart item not found');
        return { message: 'Deleted' };
    }

    async clearCartByCustomer(phone: string) {
        await this.cartRepo.delete({ phoneCustomer: phone }); // CHỈ CẦN DÒNG NÀY!
        return { message: 'Cart cleared (customer)' };
    }

    /** Xóa toàn bộ giỏ hàng theo sessionId */
    async clearCartBySession(sessionId: string) {
        // Xóa mọi cartItem gắn với sessionId
        await this.cartRepo.delete({ sessionId });
        return { message: 'Cart cleared (session)' };
    }
}
