import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreatePaymentUrlDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsString()
  orderInfo?: string;

  @IsNotEmpty()
  @IsString()
  returnUrl: string;

  @IsOptional()
  @IsString()
  bankCode?: string;
}

export class VNPayCallbackDto {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_PayDate: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHashType: string;
  vnp_SecureHash: string;
}

export class PaymentResponseDto {
  isSuccess: boolean;
  message: string;
  orderId?: string;
  amount?: number;
  transactionNo?: string;
  bankCode?: string;
  cardType?: string;
  payDate?: string;
}
