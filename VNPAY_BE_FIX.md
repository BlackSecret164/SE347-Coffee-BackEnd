# Hướng dẫn Fix Backend VNPay

## Vấn đề hiện tại
- Lỗi **"Sai chữ ký" (code=70)** từ VNPay sandbox
- Đơn hàng có payment status không đúng

## Nguyên nhân
1. **Secure Hash (chữ ký) không đúng**: VNPay yêu cầu tạo secure hash theo spec chính xác:
   - Sắp xếp tất cả parameters theo thứ tự alphabet (a-z)
   - Nối các parameters theo format: `key1=value1&key2=value2`
   - Hash với HMAC SHA512 và Hash Secret

2. **Payment status không được update sau callback**

## Giải pháp

### 1. Sử dụng thư viện VNPay đúng chuẩn

Thay vì tự code, nên dùng thư viện đã test: https://github.com/lehuygiang28/vnpay

```bash
# Trong backend project
npm install vnpay
# hoặc
yarn add vnpay
```

### 2. Code mẫu Backend API `/payment/vnpay/create`

```typescript
import { VNPay, ProductCode, VnpLocale } from 'vnpay';

// Khởi tạo VNPay instance
const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE || '3CEHDS0A',
  secureSecret: process.env.VNPAY_HASH_SECRET || 'JMQ53A9CM6XTGRPHIBU1CJ4HJFTC1J2G',
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true, // Sandbox mode
  enableLog: true,
});

// API endpoint tạo payment URL
app.post('/payment/vnpay/create', async (req, res) => {
  try {
    const { orderId, amount, orderInfo, returnUrl } = req.body;
    
    // Validate amount (tối thiểu 5000đ)
    if (amount < 5000) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền tối thiểu là 5,000đ'
      });
    }
    
    // Tạo payment URL
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_TxnRef: String(orderId), // Mã đơn hàng
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl || 'http://localhost:3000/vnpay-callback',
      vnp_Locale: VnpLocale.VN,
    });
    
    console.log('[VNPay] Payment URL created:', paymentUrl);
    
    return res.json({
      success: true,
      paymentUrl: paymentUrl,
      orderId: orderId
    });
  } catch (error) {
    console.error('[VNPay] Error creating payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tạo thanh toán VNPay',
      error: error.message
    });
  }
});
```

### 3. Code mẫu Backend API `/payment/vnpay/callback`

```typescript
app.get('/payment/vnpay/callback', async (req, res) => {
  try {
    // Lấy tất cả query parameters
    const vnpayParams = req.query;
    
    console.log('[VNPay] Callback received:', vnpayParams);
    
    // Verify chữ ký từ VNPay
    const verify = vnpay.verifyReturnUrl(vnpayParams);
    
    if (!verify.isVerified) {
      console.error('[VNPay] Invalid signature:', verify);
      return res.json({
        isSuccess: false,
        message: 'Chữ ký không hợp lệ',
      });
    }
    
    // Kiểm tra response code
    const responseCode = vnpayParams.vnp_ResponseCode;
    const orderId = vnpayParams.vnp_TxnRef;
    const amount = parseInt(vnpayParams.vnp_Amount) / 100; // VNPay trả về amount * 100
    const transactionNo = vnpayParams.vnp_TransactionNo;
    const bankCode = vnpayParams.vnp_BankCode;
    const payDate = vnpayParams.vnp_PayDate;
    
    if (responseCode === '00') {
      // Thanh toán thành công
      // Update order payment status
      await updateOrderPaymentStatus(orderId, {
        paymentStatus: 'Đã thanh toán',
        transactionNo: transactionNo,
        bankCode: bankCode,
        payDate: payDate,
      });
      
      console.log(`[VNPay] Payment success for order ${orderId}`);
      
      return res.json({
        isSuccess: true,
        message: 'Thanh toán thành công',
        orderId: orderId,
        amount: amount,
        transactionNo: transactionNo,
        bankCode: bankCode,
        payDate: payDate,
      });
    } else {
      // Thanh toán thất bại
      console.log(`[VNPay] Payment failed for order ${orderId}, code: ${responseCode}`);
      
      // Có thể update order sang trạng thái failed hoặc giữ "Chờ thanh toán"
      await updateOrderPaymentStatus(orderId, {
        paymentStatus: 'Thanh toán thất bại',
        failureReason: getVNPayErrorMessage(responseCode),
      });
      
      return res.json({
        isSuccess: false,
        message: getVNPayErrorMessage(responseCode),
        orderId: orderId,
      });
    }
  } catch (error) {
    console.error('[VNPay] Callback error:', error);
    return res.json({
      isSuccess: false,
      message: 'Có lỗi xảy ra khi xử lý callback',
    });
  }
});

// Helper function để update order payment status
async function updateOrderPaymentStatus(orderId, updates) {
  // Implement logic update database
  // Ví dụ với SQL:
  // await db.query('UPDATE orders SET payment_status = ?, transaction_no = ? WHERE id = ?', 
  //   [updates.paymentStatus, updates.transactionNo, orderId]);
  
  console.log(`[VNPay] Updated order ${orderId} payment status:`, updates);
}

// Helper function để convert VNPay response code sang message
function getVNPayErrorMessage(code) {
  const messages = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
  };
  
  return messages[code] || 'Giao dịch thất bại';
}
```

### 4. Environment Variables cần thiết

Trong backend `.env`:
```env
VNPAY_TMN_CODE=3CEHDS0A
VNPAY_HASH_SECRET=JMQ53A9CM6XTGRPHIBU1CJ4HJFTC1J2G
VNPAY_URL=https://sandbox.vnpayment.vn
```

### 5. Test Payment Flow

**Test Card Info (VNPay Sandbox)**:
- Ngân hàng: NCB
- Số thẻ: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- Mã OTP: `123456`

**Flow hoàn chỉnh**:
1. User chọn VNPay → Frontend tạo order với `paymentStatus='Chờ thanh toán'`
2. Frontend gọi `/payment/vnpay/create` → Backend tạo payment URL với chữ ký đúng
3. Redirect user đến VNPay → User nhập thông tin thẻ và OTP
4. VNPay redirect về `/vnpay-callback` → Backend verify và update `paymentStatus='Đã thanh toán'`
5. Frontend hiển thị kết quả

### 6. Debug Tips

**Kiểm tra chữ ký đúng không:**
```typescript
// Log tất cả parameters trước khi hash
console.log('VNPay params before hash:', sortedParams);
console.log('Hash secret:', process.env.VNPAY_HASH_SECRET);
console.log('Generated signature:', generatedSignature);
```

**Kiểm tra callback parameters:**
```typescript
// Log tất cả query params từ VNPay
console.log('VNPay callback params:', req.query);
```

## Checklist

- [ ] Cài đặt thư viện `vnpay` trong backend
- [ ] Update API `/payment/vnpay/create` với code mẫu
- [ ] Update API `/payment/vnpay/callback` với code mẫu
- [ ] Thêm environment variables vào backend `.env`
- [ ] Test với test card trên sandbox
- [ ] Verify order payment status được update đúng sau callback

## Tài liệu tham khảo

- VNPay Sandbox: https://sandbox.vnpayment.vn/
- VNPay Library: https://github.com/lehuygiang28/vnpay
- VNPay Official Docs: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
