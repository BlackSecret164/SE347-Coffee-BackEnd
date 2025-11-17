import { Controller, Get, Post, Param, Body, Delete, Put, Query } from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/customer.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Customer } from '../entities/customer.entity';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('/list')
  @ApiOperation({ summary: 'Get list of customers' })
  @ApiResponse({ status: 200, description: 'List of customers', type: [Customer] })
  findAll() {
    return this.customerService.findAll();
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search customers by phone' })
  @ApiResponse({ status: 200, description: 'List of customers', type: [Customer] })
  @ApiResponse({ status: 404, description: 'No customers found' })
  search(@Query('phone') phone: string) {
    return this.customerService.searchByPhone(phone);
  }

  @Get(':phone')
  @ApiOperation({ summary: 'Get customer by phone' })
  @ApiResponse({ status: 200, description: 'Customer found', type: Customer })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('phone') phone: string) {
    return this.customerService.findOne(phone);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created', type: Customer })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Put('/total/:phone')
  @ApiOperation({ summary: 'Update customer total' })
  @ApiResponse({ status: 200, description: 'Customer total updated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  updateTotal(@Param('phone') phone: string, @Body() body: { total: number }) {
    return this.customerService.updateTotal(phone, body.total);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated', type: Customer })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  update(@Param('id') id: number, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 204, description: 'Customer deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id') id: number) {
    return this.customerService.remove(id);
  }
}
