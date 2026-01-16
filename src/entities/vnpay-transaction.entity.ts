import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order_tb.entity';

/**
 * Entity lưu trữ thông tin giao dịch VNPay
 * Mỗi lần thanh toán VNPay sẽ tạo 1 record trong bảng này
 */
@Entity({ name: 'vnpay_transactions' })
export class VNPayTransaction {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  // Liên kết với Order
  @Column({ name: 'order_id', type: 'int' })
  orderId: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Thông tin giao dịch VNPay
  @Column({ name: 'vnp_txn_ref', length: 100, unique: true })
  vnpTxnRef: string; // Mã tham chiếu giao dịch (orderId)

  @Column({ name: 'vnp_transaction_no', length: 100, nullable: true })
  vnpTransactionNo: string; // Mã giao dịch tại VNPay

  @Column({ name: 'vnp_amount', type: 'bigint' })
  vnpAmount: number; // Số tiền (VNPay format: amount * 100)

  @Column({ name: 'vnp_bank_code', length: 20, nullable: true })
  vnpBankCode: string; // Mã ngân hàng (NCB, VNPAYQR, etc.)

  @Column({ name: 'vnp_card_type', length: 20, nullable: true })
  vnpCardType: string; // Loại thẻ (ATM, QRCODE, etc.)

  @Column({ name: 'vnp_order_info', length: 255, nullable: true })
  vnpOrderInfo: string; // Thông tin đơn hàng

  @Column({ name: 'vnp_pay_date', length: 14, nullable: true })
  vnpPayDate: string; // Thời gian thanh toán (YYYYMMDDHHmmss)

  @Column({ name: 'vnp_response_code', length: 2 })
  vnpResponseCode: string; // Mã kết quả (00 = success)

  @Column({ name: 'vnp_tmn_code', length: 8 })
  vnpTmnCode: string; // Mã website của merchant

  @Column({ name: 'vnp_transaction_status', length: 2, nullable: true })
  vnpTransactionStatus: string; // Trạng thái giao dịch

  @Column({ name: 'vnp_secure_hash', length: 255, nullable: true })
  vnpSecureHash: string; // Chữ ký từ VNPay

  // Metadata
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string; // IP khách hàng

  @Column({ name: 'is_success', type: 'boolean', default: false })
  isSuccess: boolean; // Giao dịch thành công hay không

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string; // Thông báo lỗi (nếu có)

  @Column({ name: 'callback_received_at', type: 'timestamp', nullable: true })
  callbackReceivedAt: Date; // Thời điểm nhận callback từ VNPay

  @Column({ name: 'ipn_received_at', type: 'timestamp', nullable: true })
  ipnReceivedAt: Date; // Thời điểm nhận IPN từ VNPay

  @Column({ name: 'raw_data', type: 'jsonb', nullable: true })
  rawData: object; // Lưu toàn bộ raw data từ VNPay để debug

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
