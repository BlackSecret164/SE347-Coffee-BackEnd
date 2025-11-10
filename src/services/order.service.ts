import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entities/order_tb.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderDto, UpdateOrderCustomerDto, CreateOrderCustomerDto } from '../dtos/order.dto';
import { OrderDetails } from '../entities/order-details.entity';
import { CreateOrderDetailsDto } from 'src/dtos/order-details.dto';
import { camelCase } from 'lodash';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderDetails)
    private readonly detailRepo: Repository<OrderDetails>,
    private readonly dataSource: DataSource,
  ) { }

  async findAll() {
    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.staff', 'staff')
      .leftJoin('order.details', 'detail')
      .select([
        'order.id AS id',
        'order.phoneCustomer AS "phoneCustomer"',
        'order.serviceType AS "serviceType"',
        'order.totalPrice AS "totalPrice"',
        'order.tableID AS "tableID"',
        'order.orderDate AS "orderDate"',
        'order.status AS "status"',
        'staff.name AS "staffName"',
        'ARRAY_AGG(detail.productID) AS "productIDs"',
      ])
      .groupBy('order.id, staff.name')
      .getRawMany();
  }

  async findLatest() {
    const raw = await this.orderRepo
      .createQueryBuilder('order')
      .select([
        'order.id AS id',
        'order.phoneCustomer AS "phoneCustomer"',
        'order.serviceType AS "serviceType"',
        'order.orderDate AS "orderDate"',
        'order.tableID AS "tableID"',
      ])
      .orderBy('order.id', 'DESC')
      .limit(1)
      .getRawOne();

    if (!raw) {
      throw new NotFoundException('No orders found');
    }

    return raw;
  }

  async findOne(id: number) {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.staff', 'staff')
      .leftJoin('order.details', 'detail')
      .select([
        'order.id AS id',
        'order.phoneCustomer AS "phoneCustomer"',
        'order.serviceType AS "serviceType"',
        'order.totalPrice AS "totalPrice"',
        'order.tableID AS "tableID"',
        'order.orderDate AS "orderDate"',
        'order.status AS "status"',
        'staff.name AS "staffName"',
        'ARRAY_AGG(detail.productID) AS "productIDs"',
      ])
      .where('order.id = :id', { id })
      .groupBy('order.id, staff.name')
      .getRawOne();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async create(dto: CreateOrderCustomerDto) {
    const order = this.orderRepo.create(dto);
    return this.orderRepo.save(order);
  }

  async update(id: number, dto: UpdateOrderCustomerDto) {
    const result = await this.orderRepo.update(id, dto);
    if (result.affected === 0) throw new NotFoundException(`Order ${id} not found`);
    return { message: 'Order edited successfully' };
  }

  async markComplete(id: number) {
    const result = await this.orderRepo.update(id, { status: 'Hoàn thành' });
    if (result.affected === 0) throw new NotFoundException(`Order ${id} not found`);
    return { message: 'Order marked as completed' };
  }

  async markCancel(id: number) {
    const result = await this.orderRepo.update(id, { status: 'Đã hủy' });
    if (result.affected === 0) throw new NotFoundException(`Order ${id} not found`);
    return { message: 'Order marked as cancelled' };
  }

  async remove(id: number) {
    const result = await this.orderRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Order ${id} not found`);
    return { message: 'Order deleted successfully' };
  }

  async addDetail(orderID: number, dto: CreateOrderDetailsDto) {
    const detail = this.detailRepo.create({
      ...dto,
      order: { id: orderID },
    });
    return this.detailRepo.save(detail);
  }

  async findAllByCustomerPhone(phone: string) {
    const orders = await this.orderRepo.find({
      where: { phoneCustomer: phone },
      relations: ['details', 'details.product', 'branch'],
      order: { orderDate: 'DESC' },
    });

    return orders.map(order => ({
      id: order.id,
      serviceType: order.serviceType,
      orderDate: order.orderDate,
      status: order.status,
      branchId: order.branchId,
      branchName: order.branch?.name ?? '',
      totalPrice: order.totalPrice,
      order_details: (order.details || [])
        .filter(d => d && d.product && d.product.id)
        .map(d => ({
          productId: d.product.id,
          size: d.size,
          mood: d.mood,
          quantity: d.quantity,
        })),
    }));
  }

  async findOneByCustomerPhone(id: number, phone: string) {
    const order = await this.orderRepo.findOne({
      where: { id, phoneCustomer: phone },
      relations: ['details', 'details.product', 'branch'],
    });
    if (!order) throw new NotFoundException('Order not found or not yours');
    return {
      id: order.id,
      serviceType: order.serviceType,
      orderDate: order.orderDate,
      status: order.status,
      branchId: order.branchId,
      branchName: order.branch?.name ?? '',
      totalPrice: order.totalPrice,
      order_details: order.details.map(d => ({
        productId: d.product.id,
        size: d.size,
        mood: d.mood,
        quantity: d.quantity,
      })),
    };
  }

  async cancelByCustomer(id: number, phone: string) {
    const result = await this.orderRepo
      .createQueryBuilder()
      .update(Order)
      .set({ status: 'Đã hủy' })
      .where('id = :id AND phoneCustomer = :phone', { id, phone })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('Order not found or not yours');
    }

    return { message: 'Order cancelled by customer' };
  }

}
