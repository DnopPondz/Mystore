// สร้าง EMVCo payload สำหรับ PromptPay (รองรับเบอร์โทร/เลขบัตรประชาชน)
// อ้างอิง CRC16-CCITT (0x1021)
function tlv(id, value) {
  const len = String(value.length).padStart(2, "0");
  return id + len + value;
}

function crc16ccitt(str) {
  // returns 4-hex uppercase
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc = crc << 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function promptPayPayload({ id, amount }) {
  // Normalize receiver
  // ถ้าเป็นเบอร์: ลบ non-digits แล้วเติมประเทศ 66 แทน 0
  let receiver = id;
  const digits = (id || "").replace(/\D/g, "");
  if (digits.length >= 9 && digits.length <= 15) {
    // assume phone
    receiver = digits.replace(/^0/, "66");
  } else {
    receiver = digits; // national id (13) ใช้ตรงๆ
  }

  const gui = tlv("00", "01");                      // Payload Format Indicator
  const initMethod = tlv("01", "11");               // Point of Initiation Method (11 = dynamic)
  const merchantInfo = (() => {
    const aid = tlv("00", "A000000677010111");      // Application ID for PromptPay
    const proxy = tlv("01", receiver);              // Receiver
    const inner = aid + proxy;
    return tlv("29", inner);                        // Merchant Account Information (ID 29)
  })();
  const cat = tlv("52", "0000");                    // Merchant Category Code
  const currency = tlv("53", "764");                // THB
  const amt = amount ? tlv("54", Number(amount).toFixed(2)) : ""; // Amount (optional)
  const country = tlv("58", "TH");
  const name = tlv("59", "BUN SHOP");               // optional merchant name
  const city = tlv("60", "BANGKOK");                // optional city

  let body = gui + initMethod + merchantInfo + cat + currency + amt + country + name + city;
  // CRC placeholder
  const toCRC = body + "6304";
  const crc = crc16ccitt(toCRC);
  return toCRC + crc;
}
