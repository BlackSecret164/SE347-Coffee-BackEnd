import { HashAlgorithm, VNPay } from 'vnpay';

export const vnpayConfig = () => ({
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE || process.env.VNP_TMNCODE || '3CEHDS0A',
    secureSecret: process.env.VNPAY_HASH_SECRET || process.env.VNP_SECRET || 'JMQ53A9CM6XTGRPHIBU1CJ4HJFTC1J2G',
    vnpayHost: process.env.VNPAY_URL || process.env.VNP_URL || 'https://sandbox.vnpayment.vn',
    testMode: process.env.NODE_ENV !== 'production',
    hashAlgorithm: 'SHA512' as const,
    enableLog: true,
  },
});

export const createVNPayInstance = () => {
  const config = {
    tmnCode: process.env.VNPAY_TMN_CODE || process.env.VNP_TMNCODE || '3CEHDS0A',
    secureSecret: process.env.VNPAY_HASH_SECRET || process.env.VNP_SECRET || 'JMQ53A9CM6XTGRPHIBU1CJ4HJFTC1J2G',
    vnpayHost: process.env.VNPAY_URL || process.env.VNP_URL || 'https://sandbox.vnpayment.vn',
    testMode: process.env.NODE_ENV !== 'production',
    hashAlgorithm: HashAlgorithm.SHA512,
    enableLog: true,
  };

  console.log('[VNPay Config] TMN Code:', config.tmnCode);
  console.log('[VNPay Config] VNPay Host:', config.vnpayHost);
  console.log('[VNPay Config] Test Mode:', config.testMode);

  return new VNPay(config);
};
