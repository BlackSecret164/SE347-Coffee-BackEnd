import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/entities/order_tb.entity';
import { OrderDetails } from 'src/entities/order-details.entity';
import { CreateOrderDto, UpdateOrderDto } from 'src/dtos/order.dto';
import { CreateOrderDetailsDto } from 'src/dtos/order-details.dto';
import { ProductSize } from 'src/entities/product_size.entity';
import { ProductBranch } from '../entities/product_branch.entity';
import { OrderStatus } from 'src/dtos/order.dto';

@Injectable()
export class BranchOrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderDetails)
    private readonly detailRepo: Repository<OrderDetails>,

    @InjectRepository(ProductSize)
    private readonly sizeRepo: Repository<ProductSize>,
    @InjectRepository(ProductBranch)
    private readonly productBranchRepo: Repository<ProductBranch>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

  ) { }

  async findAllByBranch(branchId: number) {
    return this.orderRepository.find({
      where: { branch: { id: branchId } },
      relations: ['customer', 'staff', 'table', 'details', 'details.product'],
      order: { orderDate: 'DESC' },
    });
  }

  async findLatestInBranch(branchId: number) {
    // Thay vì raw query chỉ lấy một vài trường, chúng ta load cả quan hệ details
    const order = await this.orderRepository.findOne({
      where: { branch: { id: branchId } },
      relations: ['details', 'details.product', 'table'],
      order: { id: 'DESC' },
    });
    if (!order) {
      throw new NotFoundException('No orders found in this branch');
    }

    // Tính phí giao hàng
    let deliveryFee = 0;
    if (order.serviceType === 'DELIVERY' && order.totalPrice < 250000) {
      deliveryFee = 15000;
    }

    // 2. Lấy giá từng sản phẩm theo size
    const detailItems = await Promise.all(
      order.details.map(async (d) => {
        const productSize = await this.sizeRepo.findOne({
          where: {
            product: { id: d.product.id },  // nếu có quan hệ @ManyToOne
            sizeName: d.size,
          },
        });

        const unitPrice = productSize?.price ?? 0;
        const totalItemPrice = unitPrice * d.quantity;

        return {
          productId: d.product.id,
          size: d.size,
          mood: d.mood,
          quantity: d.quantity,
          unitPrice,
          totalItemPrice,
        };
      }),
    );

    const totalProductPrice = detailItems.reduce((sum, item) => sum + item.totalItemPrice, 0);

    // 3. Tính discount
    const discount = (totalProductPrice + deliveryFee) - order.totalPrice;

    return {
      id: order.id,
      phoneCustomer: order.phoneCustomer,
      serviceType: order.serviceType,
      orderDate: order.orderDate,
      branchId: order.branchId,
      tableID: order.table?.id || null, // <- thêm dòng này
      status: order.status,
      totalPrice: order.totalPrice,
      deliveryFee: deliveryFee,
      discount: discount,
      order_details: order.details.map((d) => ({
        productId: d.product.id,
        size: d.size,
        mood: d.mood,
        quantity: d.quantity,
      })),
    };
  }

  async findOneByBranch(id: number, branchId: number) {
    const order = await this.orderRepository.findOne({
      where: { id, branch: { id: branchId } },
      relations: ['customer', 'staff', 'table', 'details', 'details.product'],
    });

    if (!order) throw new NotFoundException('Order not found in this branch');
    return order;
  }

  async create(dto: CreateOrderDto, branchId: number) {
    const order = this.orderRepository.create({
      ...dto,
      branchId: branchId,
    });
    return this.orderRepository.save(order);
  }

  async updateInBranch(id: number, dto: UpdateOrderDto, branchId: number) {
    const order = await this.orderRepository.findOne({ where: { id, branchId: branchId } });
    if (!order) throw new NotFoundException('Order not found in this branch');

    Object.assign(order, dto);
    return this.orderRepository.save(order);
  }

  async markCompleteInBranch(id: number, branchId: number) {
    const result = await this.orderRepository.update({ id, branchId: branchId }, { status: 'Hoàn thành' });
    if (result.affected === 0) throw new NotFoundException(`Order ${id} not found in branch`);
    return { message: 'Order marked as completed' };
  }

  async markCancelInBranch(id: number, branchId: number) {
    const result = await this.orderRepository.update({ id, branchId: branchId }, { status: 'Đã hủy' });
    if (result.affected === 0) throw new NotFoundException(`Order ${id} not found in branch`);
    return { message: 'Order marked as cancelled' };
  }

  // branch-order.service.ts
  async updateStatus(orderId: number, newStatus: OrderStatus, branchId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, branch: { id: branchId } } });
    if (!order) throw new NotFoundException('Order not found in your branch');

    order.status = newStatus;
    return this.orderRepo.save(order);
  }

  async addDetailInBranch(orderID: number, dto: CreateOrderDetailsDto, branchId: number) {
    // 1. Kiểm tra đơn hàng
    const order = await this.orderRepository.findOne({
      where: { id: orderID, branch: { id: branchId } },
    });

    if (!order) throw new NotFoundException('Order not found in this branch');

    // 2. Lấy product từ product_branch
    const productBranch = await this.productBranchRepo.findOne({
      where: { id: dto.productID },
      relations: ['product'],
    });

    if (!productBranch || !productBranch.product)
      throw new NotFoundException('Product not found in this branch');

    const detail = this.detailRepo.create({
      order: { id: orderID },
      product: { id: productBranch.product.id },
      quantity: dto.quantity,
      size: dto.size,
      mood: dto.mood || null,
    });

    return this.detailRepo.save(detail);
  }


  async remove(id: number, branchId: number) {
    const result = await this.orderRepository.delete({ id, branchId: branchId });
    if (result.affected === 0) throw new NotFoundException(`Order ${id} not found in branch`);
    return { message: 'Order deleted successfully' };
  }
}