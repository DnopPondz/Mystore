const FALLBACK_PROMPTPAY_ID = "0812345678";
const FALLBACK_BANK = {
  name: "บจก. Sweet Cravings",
  number: "123-4-567890",
  bank: "ธนาคารตัวอย่าง",
};

export function getPaymentConfig() {
  const promptpayId =
    (process.env.PROMPTPAY_ID || process.env.NEXT_PUBLIC_PROMPTPAY_ID || "").trim() || FALLBACK_PROMPTPAY_ID;

  return {
    promptpayId,
    bankAccount: {
      name: process.env.BANK_ACCOUNT_NAME?.trim() || FALLBACK_BANK.name,
      number: process.env.BANK_ACCOUNT_NUMBER?.trim() || FALLBACK_BANK.number,
      bank: process.env.BANK_ACCOUNT_BANK?.trim() || FALLBACK_BANK.bank,
      promptpayId,
    },
  };
}
