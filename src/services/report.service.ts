import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order_tb.entity';
import { Product } from '../entities/product.entity';
import { Customer } from '../entities/customer.entity';
import { Staff } from '../entities/staff.entity';
import { Table } from '../entities/tables.entity';
import { OrderDetails } from '../entities/order-details.entity';
import { Branch } from 'src/entities/branches.entity';

@Injectable()
export class ReportService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Table) private tableRepo: Repository<Table>,
    @InjectRepository(OrderDetails) private orderDetailRepo: Repository<OrderDetails>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
  ) { }

  async getSystemReport() {
    // Tổng quan
    const [totalPayment, totalProduct, totalCustomer, totalStaff, totalOrder, totalTable, totalBranch] = await Promise.all([
      this.orderRepo.createQueryBuilder().select('SUM(totalprice)', 'sum').getRawOne(),
      this.productRepo.count(),
      this.customerRepo.count(),
      this.staffRepo.count(),
      this.orderRepo.count(),
      this.tableRepo.count(),
      this.branchRepo.count(),
    ]);

    // Đơn hàng & doanh thu 14 ngày
    const last14DaysOrder = await this.dataSource.query(`
      SELECT DATE(orderdate) AS date, COUNT(*) AS amount
      FROM order_tb
      WHERE orderdate >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(orderdate)
      ORDER BY date ASC
    `);
    const last14DaysOrderValue = await this.dataSource.query(`
      SELECT DATE(orderdate) AS date, SUM(totalprice) AS amount
      FROM order_tb
      WHERE orderdate >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(orderdate)
      ORDER BY date ASC
    `);

    // Đơn hàng & doanh thu 30 ngày
    const last30DaysOrder = await this.dataSource.query(`
      SELECT DATE(orderdate) AS date, COUNT(*) AS amount
      FROM order_tb
      WHERE orderdate >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(orderdate)
      ORDER BY date ASC
    `);
    const last30DaysOrderValue = await this.dataSource.query(`
      SELECT DATE(orderdate) AS date, SUM(totalprice) AS amount
      FROM order_tb
      WHERE orderdate >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(orderdate)
      ORDER BY date ASC
    `);

    // Doanh thu theo loại sản phẩm
    const salesByCategory = await this.dataSource.query(`
      SELECT category, COUNT(*) AS amount
      FROM product
      JOIN order_details ON product.id = order_details.productid
      GROUP BY category
    `);

    // Xếp hạng khách hàng
    const rankMap = await this.customerRepo.query(`
      SELECT rank, COUNT(*) AS count
      FROM customer
      GROUP BY rank
    `);

    // Thống kê Takeaway / Dine-in
    const [serviceType] = await this.dataSource.query(`
      SELECT 
        SUM(CASE WHEN servicetype = 'TAKE AWAY' THEN 1 ELSE 0 END) AS takeAway,
        SUM(CASE WHEN servicetype = 'DINE IN' THEN 1 ELSE 0 END) AS dineIn,
        SUM(CASE WHEN servicetype = 'DELIVERY' THEN 1 ELSE 0 END) AS delivery
      FROM order_tb
    `);

    // Top sản phẩm bán chạy
    const topProducts = await this.dataSource.query(`
      SELECT product.name, COUNT(order_details.productid) AS amount
      FROM order_details
      JOIN product ON product.id = order_details.productid
      GROUP BY product.name
      ORDER BY amount DESC
      LIMIT 5
    `);

    return {
      totalPayment: parseFloat(totalPayment.sum) || 0,
      totalProduct,
      totalCustomer,
      totalStaff,
      totalOrder,
      totalTable,
      totalBranch,
      last14DaysOrder: last14DaysOrder.map(row => ({
        date: row.date,
        amount: parseInt(row.amount, 10),
      })),
      last14DaysOrderValue: last14DaysOrderValue.map(row => ({
        date: row.date,
        amount: parseFloat(row.amount),
      })),
      last30DaysOrder: last30DaysOrder.map(row => ({
        date: row.date,
        amount: parseInt(row.amount, 10),
      })),
      last30DaysOrderValue: last30DaysOrderValue.map(row => ({
        date: row.date,
        amount: parseFloat(row.amount),
      })),
      salesByCategory: salesByCategory.map(row => ({
        category: row.category,
        amount: parseInt(row.amount, 10),
      })),
      rankMap: rankMap.reduce((acc, row) => {
        acc[row.rank] = parseInt(row.count, 10);
        return acc;
      }, {}),
      serviceType: {
        takeAway: parseInt(serviceType.takeaway, 10),
        dineIn: parseInt(serviceType.dinein, 10),
        delivery: parseInt(serviceType.delivery, 10),
      },
      topProducts: topProducts.map(row => ({
        name: row.name,
        amount: parseInt(row.amount, 10),
      })),
    };
  }

  async getBranchReport(branchId: number) {
    // Tổng quan chi nhánh
    const [totalPayment, totalProduct, totalCustomer, totalStaff, totalOrder, totalTable] = await Promise.all([
      this.orderRepo.createQueryBuilder('o')
        .select('SUM(o.totalprice)', 'sum')
        .leftJoin('o.staff', 's')
        .where('s.branchId = :branchId', { branchId })
        .getRawOne(),
      this.productRepo
        .createQueryBuilder('p')
        .leftJoin('p.productBranches', 'pb')
        .where('pb.branchId = :branchId', { branchId })
        .getCount(),
      this.customerRepo.count(), // giả sử khách hàng không chia theo chi nhánh
      this.staffRepo.count({ where: { branch: { id: branchId } } }),
      this.orderRepo.createQueryBuilder('o')
        .leftJoin('o.staff', 's')
        .where('s.branchId = :branchId', { branchId })
        .getCount(),
      this.tableRepo.count({ where: { branch: { id: branchId } } }),
    ]);

    const query14DaysOrder = `
    SELECT DATE(o.orderdate) AS date, COUNT(*) AS amount
    FROM order_tb o
    JOIN staff s ON o.staffid = s.id
    WHERE s.branchid = $1 AND o.orderdate >= NOW() - INTERVAL '14 days'
    GROUP BY DATE(o.orderdate)
    ORDER BY date ASC
  `;
    const query14DaysValue = `
    SELECT DATE(o.orderdate) AS date, SUM(o.totalprice) AS amount
    FROM order_tb o
    JOIN staff s ON o.staffid = s.id
    WHERE s.branchid = $1 AND o.orderdate >= NOW() - INTERVAL '14 days'
    GROUP BY DATE(o.orderdate)
    ORDER BY date ASC
  `;

    const query30DaysOrder = `
    SELECT DATE(o.orderdate) AS date, COUNT(*) AS amount
    FROM order_tb o
    JOIN staff s ON o.staffid = s.id
    WHERE s.branchid = $1 AND o.orderdate >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(o.orderdate)
    ORDER BY date ASC
  `;
    const query30DaysValue = `
    SELECT DATE(o.orderdate) AS date, SUM(o.totalprice) AS amount
    FROM order_tb o
    JOIN staff s ON o.staffid = s.id
    WHERE s.branchid = $1 AND o.orderdate >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(o.orderdate)
    ORDER BY date ASC
  `;

    const [last14DaysOrder, last14DaysOrderValue, last30DaysOrder, last30DaysOrderValue] = await Promise.all([
      this.dataSource.query(query14DaysOrder, [branchId]),
      this.dataSource.query(query14DaysValue, [branchId]),
      this.dataSource.query(query30DaysOrder, [branchId]),
      this.dataSource.query(query30DaysValue, [branchId]),
    ]);

    const salesByCategory = await this.dataSource.query(`
    SELECT p.category, COUNT(*) AS amount
    FROM order_details od
    JOIN product p ON od.productid = p.id
    JOIN order_tb o ON od.orderid = o.id
    WHERE o.branchid = $1
    GROUP BY p.category
  `, [branchId]);

    const [serviceType] = await this.dataSource.query(`
    SELECT 
      SUM(CASE WHEN servicetype = 'TAKE AWAY' THEN 1 ELSE 0 END) AS takeAway,
      SUM(CASE WHEN servicetype = 'DINE IN' THEN 1 ELSE 0 END) AS dineIn,
      SUM(CASE WHEN servicetype = 'DELIVERY' THEN 1 ELSE 0 END) AS delivery
    FROM order_tb
    WHERE branchid = $1
  `, [branchId]);

    const topProducts = await this.dataSource.query(`
    SELECT p.name, COUNT(od.productid) AS amount
    FROM order_details od
    JOIN product p ON p.id = od.productid
    JOIN order_tb o ON o.id = od.orderid
    WHERE o.branchid = $1
    GROUP BY p.name
    ORDER BY amount DESC
    LIMIT 5
  `, [branchId]);

    return {
      totalPayment: parseFloat(totalPayment?.sum) || 0,
      totalProduct,
      totalCustomer,
      totalStaff,
      totalOrder,
      totalTable,
      last14DaysOrder: last14DaysOrder.map(row => ({
        date: row.date,
        amount: parseInt(row.amount, 10),
      })),
      last14DaysOrderValue: last14DaysOrderValue.map(row => ({
        date: row.date,
        amount: parseFloat(row.amount),
      })),
      last30DaysOrder: last30DaysOrder.map(row => ({
        date: row.date,
        amount: parseInt(row.amount, 10),
      })),
      last30DaysOrderValue: last30DaysOrderValue.map(row => ({
        date: row.date,
        amount: parseFloat(row.amount),
      })),
      salesByCategory: salesByCategory.map(row => ({
        category: row.category,
        amount: parseInt(row.amount, 10),
      })),
      serviceType: {
        takeAway: parseInt(serviceType.takeaway, 10),
        dineIn: parseInt(serviceType.dinein, 10),
        delivery: parseInt(serviceType.delivery, 10),
      },
      topProducts: topProducts.map(row => ({
        name: row.name,
        amount: parseInt(row.amount, 10),
      })),
    };
  }

  async getBranchMonthlyComparison() {
    const result = await this.dataSource.query(`
      SELECT
      b.id AS branchId,
      b.name AS branchName,
      COALESCE(SUM(o.totalprice), 0) AS totalRevenue,
      COUNT(DISTINCT o.id) AS "totalOrders",
      COALESCE(SUM(od.quantity_product), 0) AS totalSold
    FROM branches b
    LEFT JOIN order_tb o 
      ON o.branchid = b.id
      AND o.orderdate >= DATE_TRUNC('month', CURRENT_DATE)
      AND o.orderdate < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    LEFT JOIN order_details od 
      ON od.orderid = o.id
    GROUP BY b.id, b.name
    ORDER BY b.id;
    `);

    return result.map(row => ({
      branchId: row.branchid,
      branchName: row.branchname,
      totalRevenue: parseFloat(row.totalrevenue),
      totalOrders: parseInt(row.totalOrders, 10),
      totalSold: parseInt(row.totalsold, 10),
    }));
  }

}
