import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // Lấy danh sách khách hàng
  findAll() {
    return this.customerRepository.find();
  }

  // Tìm khách hàng theo số điện thoại
  async findOne(phone: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { phone },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with Phone ${phone} not found`);
    }
    return customer;
  }

  // Tạo khách hàng mới
  create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  // Cập nhật khách hàng
  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOne({
      where: {id},
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  // Xóa khách hàng
  async remove(id: number) {
  const customer = await this.customerRepository.findOne({ where: { id } });
  if (!customer) {
    throw new NotFoundException(`Customer with ID ${id} not found`);
  }

  await this.customerRepository.delete({ phone: customer.phone });
  return { message: 'Customer removed successfully' };
  }

  // Cập nhật tổng chi tiêu của khách hàng theo số điện thoại
  async updateTotal(phone: string, total: number) {
    const customer = await this.customerRepository.findOne({ where: { phone } });
    if (!customer) {
      throw new NotFoundException(`Customer with phone ${phone} not found`);
    }
    customer.total = total;
    await this.customerRepository.save(customer);
    return { message: 'Customer total updated successfully' };
  }

  // Tìm kiếm khách hàng theo số điện thoại
  async searchByPhone(phone: string) {
    return await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.phone LIKE :phone', { phone: `%${phone}%` })
      .limit(10)
      .getMany();
  }
}
