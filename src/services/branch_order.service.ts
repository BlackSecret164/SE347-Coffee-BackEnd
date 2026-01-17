import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDetailsDto } from 'src/dtos/order-details.dto';
import {
  CreateOrderDto,
  OrderStatus,
  UpdateOrderDto,
} from 'src/dtos/order.dto';
import { OrderDetails } from 'src/entities/order-details.entity';
import { Order } from 'src/entities/order_tb.entity';
import { ProductSize } from 'src/entities/product_size.entity';
import { Repository } from 'typeorm';
import { ProductBranch } from '../entities/product_branch.entity';
import { Staff } from '../entities/staff.entity';

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

    // Thêm Staff Repository để tìm nhân viên theo tên
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

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
            product: { id: d.product.id }, // nếu có quan hệ @ManyToOne
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

    const totalProductPrice = detailItems.reduce(
      (sum, item) => sum + item.totalItemPrice,
      0,
    );

    // 3. Tính discount
    const discount = totalProductPrice + deliveryFee - order.totalPrice;

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
    const order = await this.orderRepository.findOne({
      where: { id, branchId: branchId },
    });
    if (!order) throw new NotFoundException('Order not found in this branch');

    Object.assign(order, dto);
    return this.orderRepository.save(order);
  }

  async markCompleteInBranch(id: number, branchId: number) {
    const result = await this.orderRepository.update(
      { id, branchId: branchId },
      { status: 'Hoàn thành' },
    );
    if (result.affected === 0)
      throw new NotFoundException(`Order ${id} not found in branch`);
    return { message: 'Order marked as completed' };
  }

  async markCancelInBranch(id: number, branchId: number) {
    const result = await this.orderRepository.update(
      { id, branchId: branchId },
      { status: 'Đã hủy' },
    );
    if (result.affected === 0)
      throw new NotFoundException(`Order ${id} not found in branch`);
    return { message: 'Order marked as cancelled' };
  }

  /**
   * Cập nhật trạng thái đơn hàng và gán nhân viên
   * Logic: Chệ bắt buộc nhập staffId hoặc staffName khi đơn ở "Chờ xác nhận" chuyển sang trạng thái khác VÀ chưa có nhân viên
   * @param staffId - ID nhân viên (uưu tiên nếu có)
   * @param staffName - Tên nhân viên (dùng nếu không có staffId)
   */
  async updateStatus(
    orderId: number,
    newStatus: OrderStatus,
    branchId: number,
    staffId?: number,
    staffName?: string,
  ) {
    console.log(`Checking order ${orderId} in branch ${branchId}`);
    // Lấy order với relation staff để kiểm tra
    const order = await this.orderRepo.findOne({
      where: { id: orderId, branch: { id: branchId } },
      relations: ['staff', 'branch'],
    });

    if (!order) {
      console.error(`Order ${orderId} NOT FOUND in branch ${branchId}`);
      throw new NotFoundException('Order not found in your branch');
    }

    // Kiểm tra: Nếu đơn đang ở "Chờ xác nhận" và chuyển sang trạng thái khác
    const isLeavingPending =
      order.status === OrderStatus.PENDING && newStatus !== OrderStatus.PENDING;

    // Nếu đang chuyển từ "Chờ xác nhận" VÀ chưa có nhân viên VÀ không có staffId/staffName
    if (isLeavingPending && !order.staffID && !staffId && !staffName) {
      throw new BadRequestException(
        'Vui lòng chỉ định nhân viên xử lý đơn hàng khi xác nhận (staffId hoặc staffName)',
      );
    }

    // Cập nhật trạng thái
    order.status = newStatus;

    let assignedStaffName: string | null = null;

    // Logic gán nhân viên: Uưu tiên staffId, nếu không có thì dùng staffName
    if (staffId) {
      // Cách 1: Dùng staffId (nhanh và chính xác)
      const staff = await this.staffRepo.findOne({
        where: {
          id: staffId,
          branch: { id: branchId },
        },
      });

      if (!staff) {
        throw new NotFoundException(
          `Không tìm thấy nhân viên với ID ${staffId} trong chi nhánh`,
        );
      }

      // Gán nhân viên cho đơn hàng
      order.staffID = staff.id;
      order.staff = staff;
      assignedStaffName = staff.name;
    } else if (staffName) {
      // Cách 2: Dùng staffName (tìm theo tên, trim và case-insensitive)
      const trimmedName = staffName.trim();

      // Sử dụng query builder để search case-insensitive và trim
      const staff = await this.staffRepo
        .createQueryBuilder('staff')
        .where('LOWER(TRIM(staff.name)) = LOWER(:name)', { name: trimmedName })
        .andWhere('staff.branchId = :branchId', { branchId })
        .getOne();

      if (!staff) {
        throw new NotFoundException(
          `Không tìm thấy nhân viên "${trimmedName}" trong chi nhánh`,
        );
      }

      // Gán nhân viên cho đơn hàng
      order.staffID = staff.id;
      order.staff = staff;
      assignedStaffName = staff.name.trim();
    }

    const savedOrder = await this.orderRepo.save(order);

    return {
      ...savedOrder,
      message: assignedStaffName
        ? `Đã cập nhật trạng thái thành "${newStatus}" và gán cho nhân viên "${assignedStaffName}" (ID: ${savedOrder.staffID})`
        : `Đã cập nhật trạng thái thành "${newStatus}"`,
    };
  }

  async addDetailInBranch(
    orderID: number,
    dto: CreateOrderDetailsDto,
    branchId: number,
  ) {
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
    const result = await this.orderRepository.delete({
      id,
      branchId: branchId,
    });
    if (result.affected === 0)
      throw new NotFoundException(`Order ${id} not found in branch`);
    return { message: 'Order deleted successfully' };
  }
}
