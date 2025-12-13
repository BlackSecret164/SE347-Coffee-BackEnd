import { HashAlgorithm, VNPay } from 'vnpay';

export const vnpayConfig = () => ({
  vnpay: {
    tmnCode: process.env.VNP_TMNCODE || '',
    secureSecret: process.env.VNP_SECRET || '',
    vnpayHost: process.env.VNP_URL || 'https://sandbox.vnpayment.vn',
    testMode: process.env.NODE_ENV !== 'production',
    hashAlgorithm: 'SHA512' as const,
    enableLog: true,
  },
});

export const createVNPayInstance = () => {
  return new VNPay({
    tmnCode: process.env.VNP_TMNCODE || '',
    secureSecret: process.env.VNP_SECRET || '',
    vnpayHost: process.env.VNP_URL || 'https://sandbox.vnpayment.vn',
    testMode: process.env.NODE_ENV !== 'production',
    hashAlgorithm: HashAlgorithm.SHA512,
    enableLog: true,
  });
};
