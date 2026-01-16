# VNPay Transactions Database Schema

## Tổng quan

Bảng `vnpay_transactions` lưu trữ toàn bộ thông tin giao dịch VNPay, phục vụ cho:
- ✅ Audit trail & compliance
- ✅ Reconciliation với VNPay
- ✅ Debug & troubleshooting
- ✅ Xử lý duplicate callbacks
- ✅ Customer support & khiếu nại

## Schema

### Table: `vnpay_transactions`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | int | NO | Primary key |
| `order_id` | int | NO | Foreign key tới `order_tb.id` |
| `vnp_txn_ref` | varchar(100) | NO | Mã tham chiếu giao dịch (unique) |
| `vnp_transaction_no` | varchar(100) | YES | Mã giao dịch VNPay |
| `vnp_amount` | bigint | NO | Số tiền (VNPay format: amount * 100) |
| `vnp_bank_code` | varchar(20) | YES | Mã ngân hàng (NCB, VNPAYQR, etc.) |
| `vnp_card_type` | varchar(20) | YES | Loại thẻ (ATM, QRCODE, etc.) |
| `vnp_order_info` | varchar(255) | YES | Thông tin đơn hàng |
| `vnp_pay_date` | varchar(14) | YES | Ngày thanh toán (YYYYMMDDHHmmss) |
| `vnp_response_code` | varchar(2) | NO | Mã kết quả ('00' = success) |
| `vnp_tmn_code` | varchar(8) | NO | Mã merchant |
| `vnp_transaction_status` | varchar(2) | YES | Trạng thái giao dịch |
| `vnp_secure_hash` | varchar(255) | YES | Chữ ký từ VNPay |
| `ip_address` | varchar(45) | YES | IP khách hàng |
| `is_success` | boolean | NO | Thành công hay không (default: false) |
| `error_message` | text | YES | Thông báo lỗi nếu failed |
| `callback_received_at` | timestamp | YES | Thời điểm nhận callback |
| `ipn_received_at` | timestamp | YES | Thời điểm nhận IPN |
| `raw_data` | jsonb | YES | Raw data từ VNPay (debug) |
| `created_at` | timestamp | NO | Thời điểm tạo record |
| `updated_at` | timestamp | NO | Thời điểm update |

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_vnpay_transactions_order_id ON vnpay_transactions(order_id);
CREATE INDEX idx_vnpay_transactions_vnp_txn_ref ON vnpay_transactions(vnp_txn_ref);
CREATE INDEX idx_vnpay_transactions_vnp_transaction_no ON vnpay_transactions(vnp_transaction_no);
CREATE INDEX idx_vnpay_transactions_is_success ON vnpay_transactions(is_success);
CREATE INDEX idx_vnpay_transactions_created_at ON vnpay_transactions(created_at);
```

### Foreign Keys

```sql
-- Liên kết với order_tb
ALTER TABLE vnpay_transactions 
  ADD CONSTRAINT fk_vnpay_transactions_order 
  FOREIGN KEY (order_id) 
  REFERENCES order_tb(id) 
  ON DELETE CASCADE;
```

## Relationships

```
order_tb (1) ----< (N) vnpay_transactions
```

Một order có thể có nhiều VNPay transactions do:
- User retry payment nhiều lần
- VNPay gửi duplicate callbacks
- Failed transactions được retry

## Queries thường dùng

### 1. Lấy tất cả transactions của một order

```sql
SELECT * FROM vnpay_transactions 
WHERE order_id = 123 
ORDER BY created_at DESC;
```

### 2. Lấy transactions thành công trong ngày

```sql
SELECT * FROM vnpay_transactions 
WHERE is_success = true 
  AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

### 3. Tìm transactions theo mã VNPay

```sql
SELECT * FROM vnpay_transactions 
WHERE vnp_transaction_no = '14123456';
```

### 4. Lấy tổng doanh thu VNPay theo ngày

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN is_success = true THEN vnp_amount ELSE 0 END) / 100 as total_amount
FROM vnpay_transactions
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 5. Tìm transactions failed để xử lý

```sql
SELECT 
  vt.*,
  o.id as order_id,
  o.phoneCustomer
FROM vnpay_transactions vt
JOIN order_tb o ON vt.order_id = o.id
WHERE vt.is_success = false
  AND vt.vnp_response_code != '24' -- Exclude user cancelled
ORDER BY vt.created_at DESC;
```

### 6. Reconciliation: So sánh với orders

```sql
SELECT 
  o.id as order_id,
  o.paymentStatus as order_payment_status,
  vt.is_success as vnpay_success,
  vt.vnp_transaction_no,
  vt.vnp_amount / 100 as amount
FROM order_tb o
LEFT JOIN vnpay_transactions vt ON o.id = vt.order_id
WHERE o.paymentMethod = 'VNPay'
  AND o.paymentStatus != 'Đã thanh toán'
  AND vt.is_success = true;
-- Những order này có VNPay success nhưng paymentStatus chưa update
```

## Migration

### Chạy migration để tạo bảng:

```bash
# Nếu dùng TypeORM CLI
npm run typeorm migration:run

# Hoặc tự động sync (development only)
# Đã config trong TypeOrmConfig
```

### Rollback migration:

```bash
npm run typeorm migration:revert
```

## Use Cases

### 1. Xử lý Duplicate Callbacks

VNPay có thể gửi callback nhiều lần. Code đã xử lý:

```typescript
// Trong saveVNPayTransaction()
const existing = await this.vnpayTransactionRepo.findOne({
  where: { vnpTxnRef: data.vnpTxnRef },
});

if (existing) {
  // Update thay vì tạo mới
  return await this.vnpayTransactionRepo.save({ ...existing, ...data });
}
```

### 2. Reconciliation với VNPay

Cuối ngày/tháng, có thể đối chiếu:

```typescript
// Service method để reconcile
async reconcileVNPayTransactions(date: Date) {
  const transactions = await this.vnpayTransactionRepo.find({
    where: {
      isSuccess: true,
      createdAt: Between(startOfDay(date), endOfDay(date)),
    },
  });
  
  // Export CSV hoặc compare với VNPay report
  return transactions;
}
```

### 3. Customer Support

Khi khách hàng khiếu nại:

```typescript
async getTransactionHistory(orderId: number) {
  return await this.vnpayTransactionRepo.find({
    where: { orderId },
    order: { createdAt: 'DESC' },
  });
}
```

### 4. Analytics & Reporting

```typescript
async getVNPayStats(startDate: Date, endDate: Date) {
  return await this.vnpayTransactionRepo
    .createQueryBuilder('vt')
    .select('DATE(vt.created_at)', 'date')
    .addSelect('COUNT(*)', 'total')
    .addSelect('SUM(CASE WHEN vt.is_success THEN 1 ELSE 0 END)', 'success')
    .addSelect('SUM(CASE WHEN vt.is_success THEN vt.vnp_amount ELSE 0 END) / 100', 'revenue')
    .where('vt.created_at BETWEEN :start AND :end', { start: startDate, end: endDate })
    .groupBy('DATE(vt.created_at)')
    .getRawMany();
}
```

## Security & Best Practices

1. ✅ **Raw Data Storage**: Lưu toàn bộ params từ VNPay trong `raw_data` (jsonb) để debug
2. ✅ **Unique Constraint**: `vnp_txn_ref` là unique để tránh duplicate
3. ✅ **Cascade Delete**: Khi xóa order thì xóa luôn transactions
4. ✅ **Timestamps**: Track cả `callback_received_at` và `ipn_received_at`
5. ✅ **Indexes**: Đánh index các cột hay query (order_id, vnp_txn_ref, is_success, created_at)

## Monitoring & Alerts

### Alert cho failed transactions

```sql
-- Cron job check failed transactions trong 1 giờ qua
SELECT COUNT(*) FROM vnpay_transactions
WHERE is_success = false
  AND vnp_response_code NOT IN ('24', '11') -- Exclude user cancel & timeout
  AND created_at > NOW() - INTERVAL '1 hour';
```

### Alert cho transactions không có IPN

```sql
-- Transactions thành công nhưng chưa nhận IPN sau 5 phút
SELECT * FROM vnpay_transactions
WHERE is_success = true
  AND ipn_received_at IS NULL
  AND created_at < NOW() - INTERVAL '5 minutes';
```

## Ví dụ dữ liệu

```json
{
  "id": 1,
  "order_id": 123,
  "vnp_txn_ref": "ORDER123456",
  "vnp_transaction_no": "14123456",
  "vnp_amount": 5000000,
  "vnp_bank_code": "NCB",
  "vnp_card_type": "ATM",
  "vnp_order_info": "Thanh toan don hang #123456",
  "vnp_pay_date": "20260117153000",
  "vnp_response_code": "00",
  "vnp_tmn_code": "3CEHDS0A",
  "is_success": true,
  "callback_received_at": "2026-01-17T15:30:15Z",
  "ipn_received_at": "2026-01-17T15:30:20Z",
  "raw_data": {
    "vnp_Amount": "5000000",
    "vnp_BankCode": "NCB",
    "vnp_ResponseCode": "00",
    "vnp_SecureHash": "abc123...",
    ...
  },
  "created_at": "2026-01-17T15:30:15Z",
  "updated_at": "2026-01-17T15:30:20Z"
}
```

## Tài liệu liên quan

- [VNPAY_USAGE.md](./VNPAY_USAGE.md) - Hướng dẫn sử dụng API
- [VNPAY_BE_FIX.md](./VNPAY_BE_FIX.md) - Hướng dẫn fix backend
- [VNPay Official Docs](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/)
