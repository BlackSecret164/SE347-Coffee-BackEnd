import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart_item.entity';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { ProductSize } from '../entities/product_size.entity';
import { UpdateCartItemDto, CreateCartItemDto } from '../dtos/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductSize) private productSizeRepo: Repository<ProductSize>,
  ) {}

  async findAll(phoneCustomer: string) {
    const items = await this.cartRepo.find({
      where: { phoneCustomer },
      relations: ['product', 'branch'],
    });

    return Promise.all(
      items.map(async (item) => {
        const productSize = await this.productSizeRepo.findOne({
          where: {
            product: { id: item.product.id },
            sizeName: item.size,
          },
        });

        return {
          id: item.id,
          quantity: item.quantity,
          size: item.size,
          mood: item.mood,
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: productSize?.price ?? 0,
          branchId: item.branchId,
        };
      }),
    );
  }

  async create(dto: CreateCartItemDto) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Kiểm tra nếu có branchId trong DTO
    if (dto.branchId) {
      const existingCartItems = await this.cartRepo.find({
        where: { phoneCustomer: dto.phoneCustomer },
      });

      // Nếu giỏ hàng đã có sản phẩm từ chi nhánh khác
      const conflictItem = existingCartItems.find(
        (item) => item.branchId && item.branchId !== dto.branchId
      );

      if (conflictItem) {
        throw new ConflictException(
          `Giỏ hàng chỉ có thể chứa sản phẩm từ một chi nhánh. ` +
          `Vui lòng xóa giỏ hàng hoặc chọn sản phẩm từ cùng chi nhánh.`
        );
      }
    }

    // Kiểm tra sản phẩm đã tồn tại trong giỏ chưa
    const existingItem = await this.cartRepo.findOne({
      where: {
        phoneCustomer: dto.phoneCustomer,
        product: { id: dto.productId },
        size: dto.size,
        mood: dto.mood,
      },
      relations: ['product'],
    });

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      return this.cartRepo.save(existingItem);
    }

    // Tạo mục giỏ hàng mới
    const cartItem = this.cartRepo.create({
      phoneCustomer: dto.phoneCustomer,
      quantity: dto.quantity,
      size: dto.size,
      mood: dto.mood,
      product,
      branchId: dto.branchId,
    });

    return this.cartRepo.save(cartItem);
  }

  async update(id: number, dto: UpdateCartItemDto) {
    const item = await this.cartRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Cart item not found');

    item.quantity = dto.quantity;
    item.size = dto.size;
    item.mood = dto.mood;
    // Note: không update branchId (đã cố định khi create)

    return this.cartRepo.save(item);
  }

  async remove(id: number) {
    const result = await this.cartRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Cart item not found');
    }
    return { message: 'Deleted' };
  }

  async clearCartByCustomer(phoneCustomer: string) {
    await this.cartRepo.delete({ phoneCustomer });
    return { message: 'Cart cleared' };
  }

  // Lấy branchId từ mục giỏ hàng đầu tiên của khách hàng
  async getCartBranchId(phoneCustomer: string): Promise<number | null> {
    const firstItem = await this.cartRepo.findOne({
      where: { phoneCustomer },
      order: { id: 'ASC' },
    });
    return firstItem?.branchId ?? null;
  }
}