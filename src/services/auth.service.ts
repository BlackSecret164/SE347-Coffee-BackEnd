import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StaffDto } from '../dtos/staff.dto';
import { StaffSigninDto, RegisterCustomerDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) { }

  // src/services/auth.service.ts
  async signin(dto: StaffSigninDto) {
    const { phone, password, userType } = dto;

    let userQuery = '';
    let tokenPayload: any = {};
    let user: any;

    if (userType === 'staff') {
      const result = await this.dataSource.query('SELECT * FROM staff WHERE phone = $1', [phone]);

      if (result.length === 0) {
        throw new UnauthorizedException('Staff not found!');
      }

      user = result[0];
      if (user.password !== password) {
        throw new UnauthorizedException('Invalid password!');
      }

      tokenPayload = {
        id: user.id,
        phone: user.phone,
        role: user.role,
        branchId: user.branchid,
        type: 'staff',
      };

      return {
        message: 'Staff signin successful!',
        token: this.jwtService.sign(tokenPayload),
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          branchId: user.branchid,
        },
      };
    }

    if (userType === 'customer') {
      const result = await this.dataSource.query(
        'SELECT * FROM customer WHERE phone = $1',
        [phone],
      );

      if (result.length === 0) {
        throw new UnauthorizedException('Customer not found!');
      }

      user = result[0];

      if (user.password !== password) {
        throw new UnauthorizedException('Invalid password!');
      }

      tokenPayload = {
        phone: user.phone,
        name: user.name,
        role: 'CUSTOMER', // Gán mặc định
        type: 'customer',
      };

      return {
        message: 'Customer signin successful!',
        token: this.jwtService.sign(tokenPayload),
        user: {
          phone: user.phone,
          name: user.name,
          rank: user.rank,
          role: 'CUSTOMER', // Gán mặc định trong response
        },
      };
    }
    throw new UnauthorizedException('Invalid user type');
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    const { phone, name, gender, address, password } = dto;

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existing = await this.dataSource.query(
      'SELECT * FROM customer WHERE phone = $1',
      [phone],
    );

    if (existing.length > 0) {
      throw new UnauthorizedException('Số điện thoại đã được đăng ký');
    }

    const registrationDate = new Date();

    // Thêm khách hàng mới
    await this.dataSource.query(
      `INSERT INTO customer (phone, name, gender, address, password, registrationdate)
     VALUES ($1, $2, $3, $4, $5, $6)`,
      [phone, name, gender, address, password, registrationDate],
    );

    const tokenPayload = {
      phone,
      name,
      role: 'CUSTOMER',
      type: 'customer',
    };

    return {
      message: 'Đăng ký thành công!',
      token: this.jwtService.sign(tokenPayload),
      user: {
        phone,
        name,
        gender,
        address,
        role: 'CUSTOMER',
      },
    };
  }

  async callback(authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    const decoded = this.jwtService.verify(token);

    if (!decoded || !decoded.type) {
      throw new UnauthorizedException('Invalid token');
    }

    // STAFF CASE
    if (decoded.type === 'staff') {
      const staffID = decoded.id;

      const userResult = await this.dataSource.query(
        `SELECT id, name, gender, birth, address, phone, workhours as "workHours", minsalary, typestaff as "typeStaff", role, image
       FROM staff WHERE id = $1`,
        [staffID],
      );

      if (userResult.length === 0) {
        throw new UnauthorizedException('Staff not found');
      }

      const user = userResult[0];

      // Ghi log
      await this.dataSource.query(
        `INSERT INTO activity_logs (staffid, action, timestamp) VALUES ($1, $2, $3)`,
        [user.id, 'User accessed callback API', new Date()],
      );

      return {
        msg: 'ok',
        data: {
          ...user,
          type: 'staff',
        },
      };
    }

    // CUSTOMER CASE
    if (decoded.type === 'customer') {
      const phone = decoded.phone;

      const userResult = await this.dataSource.query(
        `SELECT phone, name, address, gender, total, rank, image
       FROM customer WHERE phone = $1`,
        [phone],
      );

      if (userResult.length === 0) {
        throw new UnauthorizedException('Customer not found');
      }

      const user = userResult[0];

      return {
        msg: 'ok',
        data: {
          ...user,
          type: 'customer',
        },
      };
    }

    throw new UnauthorizedException('Unsupported user type');
  }
}
