# Hướng dẫn sử dụng VNPay Payment API

## Endpoints

### 1. Tạo Payment URL
**POST** `/payment/vnpay/create`

Tạo URL thanh toán VNPay để redirect khách hàng đến trang thanh toán.

#### Request Body:
```json
{
  "orderId": "ORDER123456",
  "amount": 50000,
  "orderInfo": "Thanh toan don hang #123456",
  "returnUrl": "http://localhost:3000/payment-result",
  "bankCode": "NCB"
}
```

#### Parameters:
- `orderId` (string, required): Mã đơn hàng duy nhất
- `amount` (number, required): Số tiền thanh toán (tối thiểu 5,000đ)
- `orderInfo` (string, optional): Thông tin đơn hàng
- `returnUrl` (string, required): URL để VNPay redirect về sau khi thanh toán
- `bankCode` (string, optional): Mã ngân hàng (NCB, VNPAYQR, etc.)

#### Response Success:
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "orderId": "ORDER123456"
}
```

#### Response Error:
```json
{
  "success": false,
  "message": "Số tiền tối thiểu là 5,000đ",
  "error": "..."
}
```

### 2. Payment Callback
**GET** `/payment/vnpay/callback`

Endpoint để VNPay redirect về sau khi khách hàng hoàn tất thanh toán.

#### Query Parameters (từ VNPay):
VNPay sẽ tự động gửi các parameters sau qua query string:
- `vnp_Amount`: Số tiền (đã nhân 100)
- `vnp_BankCode`: Mã ngân hàng
- `vnp_ResponseCode`: Mã kết quả giao dịch
- `vnp_TransactionNo`: Mã giao dịch VNPay
- `vnp_TxnRef`: Mã đơn hàng
- `vnp_SecureHash`: Chữ ký bảo mật
- ... và các params khác

#### Response Success (ResponseCode = '00'):
```json
{
  "isSuccess": true,
  "message": "Thanh toán thành công",
  "orderId": "ORDER123456",
  "amount": 50000,
  "transactionNo": "14123456",
  "bankCode": "NCB",
  "cardType": "ATM",
  "payDate": "20260116153000"
}
```

#### Response Failed:
```json
{
  "isSuccess": false,
  "message": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
  "orderId": "ORDER123456"
}
```

### 3. IPN Handler
**POST** `/payment/vnpay/ipn`

Endpoint để VNPay gửi thông báo thanh toán (Instant Payment Notification).

#### Response:
```json
{
  "RspCode": "00",
  "Message": "Success"
}
```

## VNPay Response Codes

| Code | Ý nghĩa |
|------|---------|
| 00 | Giao dịch thành công |
| 07 | Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường) |
| 09 | Thẻ/Tài khoản chưa đăng ký InternetBanking |
| 10 | Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần |
| 11 | Đã hết hạn chờ thanh toán |
| 12 | Thẻ/Tài khoản bị khóa |
| 13 | Nhập sai mật khẩu OTP |
| 24 | Khách hàng hủy giao dịch |
| 51 | Tài khoản không đủ số dư |
| 65 | Vượt quá hạn mức giao dịch trong ngày |
| 75 | Ngân hàng thanh toán đang bảo trì |
| 79 | Nhập sai mật khẩu thanh toán quá số lần quy định |
| 99 | Các lỗi khác |

## Flow thanh toán hoàn chỉnh

```
1. Frontend gọi POST /payment/vnpay/create
   └─> Backend trả về paymentUrl
   
2. Frontend redirect user đến paymentUrl
   └─> User nhập thông tin thẻ tại VNPay
   
3. VNPay redirect về returnUrl với query params
   └─> Frontend gọi GET /payment/vnpay/callback với params
   └─> Backend verify và trả về kết quả
   
4. (Optional) VNPay gửi IPN đến backend
   └─> Backend xác nhận và update database
```

## Test với VNPay Sandbox

### Thông tin Test Card (NCB Bank):
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mã OTP**: `123456`

### Test Case Examples:

#### 1. Thanh toán thành công:
```bash
curl -X POST http://localhost:3000/payment/vnpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST001",
    "amount": 50000,
    "orderInfo": "Test payment",
    "returnUrl": "http://localhost:3000/payment-result"
  }'
```

#### 2. Thanh toán với số tiền nhỏ hơn min (sẽ lỗi):
```bash
curl -X POST http://localhost:3000/payment/vnpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST002",
    "amount": 3000,
    "orderInfo": "Test payment",
    "returnUrl": "http://localhost:3000/payment-result"
  }'
```

## Environment Variables

Đảm bảo file `.env` có các biến sau:

```env
# VNPay Configuration (Recommended)
VNPAY_TMN_CODE=3CEHDS0A
VNPAY_HASH_SECRET=JMQ53A9CM6XTGRPHIBU1CJ4HJFTC1J2G
VNPAY_URL=https://sandbox.vnpayment.vn

# Hoặc sử dụng tên cũ (backward compatible)
VNP_TMNCODE=3CEHDS0A
VNP_SECRET=ZX4WM4NUVU9YKIR2WOEPFBTI3B5XAKQW
VNP_URL=https://sandbox.vnpayment.vn

NODE_ENV=development
```

## Lưu ý quan trọng

1. ✅ **Số tiền tối thiểu**: 5,000đ (đã validate trong code)
2. ✅ **Secure Hash**: Được tự động tạo bởi thư viện `vnpay`
3. ✅ **Verify Signature**: Callback tự động verify chữ ký từ VNPay
4. ⚠️ **Production**: Đổi `VNPAY_URL` sang `https://vnpayment.vn` và cập nhật TMN_CODE, HASH_SECRET thật
5. 📝 **Order Status**: Cần implement logic update payment status vào database sau khi verify thành công
6. 🔒 **Security**: Return URL nên check origin và validate params

## Integration với Order Service

Sau khi verify payment thành công, cần update order status:

```typescript
// Trong verifyPayment method
if (responseCode === '00') {
  // TODO: Implement update order
  await this.orderService.updateOrderPaymentStatus(orderId, {
    paymentStatus: 'Đã thanh toán',
    paymentMethod: 'VNPay',
    transactionNo: transactionNo,
    bankCode: bankCode,
    paidAt: new Date(payDate),
  });
}
```

## Troubleshooting

### Lỗi "Sai chữ ký" (code=70)
- ✅ Đã fix: Code hiện tại sử dụng thư viện `vnpay` chính xác
- Kiểm tra `VNPAY_HASH_SECRET` có đúng không
- Xem log `[VNPay Config]` khi khởi động server

### Payment status không update
- Implement logic update database trong `verifyPayment` và `handleIpn`
- Kiểm tra callback URL có accessible từ VNPay không

### Test card không hoạt động
- Đảm bảo dùng đúng thông tin test card của VNPay Sandbox
- Số thẻ: `9704198526191432198`, OTP: `123456`

## Logs để Debug

Code đã có logging chi tiết với prefix `[VNPay]`:

```
[VNPay Config] TMN Code: 3CEHDS0A
[VNPay Config] VNPay Host: https://sandbox.vnpayment.vn
[VNPay] Creating payment URL for order ORDER123456, amount: 50000đ, IP: 127.0.0.1
[VNPay] Payment URL created successfully for order ORDER123456
[VNPay] Verifying payment callback from VNPay
[VNPay] Payment success for order ORDER123456, amount: 50000đ, transactionNo: 14123456
```

## Tài liệu tham khảo

- [VNPay Sandbox](https://sandbox.vnpayment.vn/)
- [VNPay Library Documentation](https://github.com/lehuygiang28/vnpay)
- [VNPay Official API Docs](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/)
