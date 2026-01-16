import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateVNPayTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsString()
  vnpTxnRef: string;

  @IsNotEmpty()
  @IsNumber()
  vnpAmount: number;

  @IsNotEmpty()
  @IsString()
  vnpTmnCode: string;

  @IsOptional()
  @IsString()
  vnpTransactionNo?: string;

  @IsOptional()
  @IsString()
  vnpBankCode?: string;

  @IsOptional()
  @IsString()
  vnpCardType?: string;

  @IsOptional()
  @IsString()
  vnpOrderInfo?: string;

  @IsOptional()
  @IsString()
  vnpPayDate?: string;

  @IsNotEmpty()
  @IsString()
  vnpResponseCode: string;

  @IsOptional()
  @IsString()
  vnpTransactionStatus?: string;

  @IsOptional()
  @IsString()
  vnpSecureHash?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsBoolean()
  isSuccess?: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsObject()
  rawData?: object;
}

export class UpdateVNPayTransactionDto {
  @IsOptional()
  @IsString()
  vnpTransactionNo?: string;

  @IsOptional()
  @IsString()
  vnpBankCode?: string;

  @IsOptional()
  @IsString()
  vnpCardType?: string;

  @IsOptional()
  @IsString()
  vnpPayDate?: string;

  @IsOptional()
  @IsString()
  vnpResponseCode?: string;

  @IsOptional()
  @IsBoolean()
  isSuccess?: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsObject()
  rawData?: object;
}
