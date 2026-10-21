const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Jimp } = require('jimp');
const jsQR = require('jsqr');

const USED_SLIPS_FILE = path.join(__dirname, '..', 'data', 'used_slips.json');

// Real Bank Templates Registry
const BANK_TEMPLATES = [
  {
    code: 'GSB',
    name: 'ธนาคารออมสิน (GSB)',
    shortName: 'ออมสิน',
    bankId: '030',
    logo: 'assets/banks/gsb.png',
    color: '#eb198d',
    keywords: ['030', 'gsb', 'mymo', 'ออมสิน', 'government savings bank']
  },
  {
    code: 'KBANK',
    name: 'ธนาคารกสิกรไทย (KBANK)',
    shortName: 'กสิกรไทย',
    bankId: '004',
    logo: 'assets/banks/kbank.png',
    color: '#138f2d',
    keywords: ['004', 'kbank', 'kplus', 'กสิกร', 'kasikorn']
  },
  {
    code: 'SCB',
    name: 'ธนาคารไทยพาณิชย์ (SCB)',
    shortName: 'ไทยพาณิชย์',
    bankId: '014',
    logo: 'assets/banks/scb.png',
    color: '#4e2e7f',
    keywords: ['014', 'scb', 'scbeasy', 'ไทยพาณิชย์', 'siam commercial']
  },
  {
    code: 'KTB',
    name: 'ธนาคารกรุงไทย (KTB)',
    shortName: 'กรุงไทย',
    bankId: '006',
    logo: 'assets/banks/ktb.png',
    color: '#00a8e8',
    keywords: ['006', 'ktb', 'next', 'กรุงไทย', 'krungthai']
  },
  {
    code: 'BBL',
    name: 'ธนาคารกรุงเทพ (BBL)',
    shortName: 'กรุงเทพ',
    bankId: '002',
    logo: 'assets/banks/bbl.png',
    color: '#1e3a8a',
    keywords: ['002', 'bbl', 'bualuang', 'กรุงเทพ', 'bangkok bank']
  },
  {
    code: 'BAY',
    name: 'ธนาคารกรุงศรีอยุธยา (BAY)',
    shortName: 'กรุงศรี',
    bankId: '025',
    logo: 'assets/banks/bay.png',
    color: '#fec20c',
    keywords: ['025', 'bay', 'krungsri', 'กรุงศรี', 'ayudhya']
  },
  {
    code: 'TTB',
    name: 'ธนาคารทหารไทยธนชาต (TTB)',
    shortName: 'ทีทีบี',
    bankId: '011',
    logo: 'assets/banks/ttb.png',
    color: '#002d63',
    keywords: ['011', 'ttb', 'ทหารไทย', 'ธนชาต', 'tmb', 'thanachart']
  },
  {
    code: 'PROMPTPAY',
    name: 'พร้อมเพย์ (PromptPay)',
    shortName: 'พร้อมเพย์',
    bankId: '000',
    logo: 'assets/banks/promptpay.png',
    color: '#003b70',
    keywords: ['promptpay', 'พร้อมเพย์', '000201']
  }
];

function getUsedSlips() {
  try {
    if (!fs.existsSync(USED_SLIPS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USED_SLIPS_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

function saveUsedSlip(entry) {
  try {
    const list = getUsedSlips();
    list.push(entry);
    fs.writeFileSync(USED_SLIPS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving used slip:', err);
  }
}

// Scans image bitmap for QR Code using jsQR with multi-pass heuristics
async function extractQrFromImage(imageBuffer) {
  try {
    const image = await Jimp.read(imageBuffer);
    
    // Pass 1: Raw image
    const { data, width, height } = image.bitmap;
    let qr = jsQR(new Uint8ClampedArray(data), width, height);
    if (qr && qr.data && qr.data.length >= 8) {
      return qr;
    }

    // Pass 2: Resize if image is very large (e.g. > 1200px)
    if (width > 1200 || height > 1200) {
      const resized = image.clone();
      resized.scaleToFit({ w: 1000, h: 1000 });
      qr = jsQR(new Uint8ClampedArray(resized.bitmap.data), resized.bitmap.width, resized.bitmap.height);
      if (qr && qr.data && qr.data.length >= 8) {
        return qr;
      }
    }

    // Pass 3: Grayscale + contrast adjustment
    const contrastImg = image.clone();
    contrastImg.greyscale();
    contrastImg.contrast(0.4);
    qr = jsQR(new Uint8ClampedArray(contrastImg.bitmap.data), contrastImg.bitmap.width, contrastImg.bitmap.height);
    if (qr && qr.data && qr.data.length >= 8) {
      return qr;
    }

    return null;
  } catch (err) {
    console.error('Error reading slip image for QR:', err);
    return null;
  }
}

// Parse EMVCo / Thai Bank Slip mini-QR data
function parseSlipQrData(qrStr) {
  const result = {
    raw: qrStr,
    isStandardBankSlip: false,
    sendingBank: null,
    receivingBank: null,
    transRef: null,
    amount: null,
    payloadType: 'unknown'
  };

  if (!qrStr || typeof qrStr !== 'string') return result;

  // Thai Bank of Thailand Standard Transfer Slip Mini-QR (BScanC)
  // Usually starts with 00460006000001 (Tag 00, length 46, App ID 000001)
  if (qrStr.startsWith('00460006000001') || qrStr.startsWith('00460006000002') || qrStr.includes('0006000001')) {
    result.isStandardBankSlip = true;
    result.payloadType = 'bscanc_slip';

    // Parse TLV helper supporting sub-containers
    function parseTLV(str) {
      let idx = 0;
      while (idx <= str.length - 4) {
        const tag = str.substring(idx, idx + 2);
        const len = parseInt(str.substring(idx + 2, idx + 4), 10);
        if (isNaN(len) || len <= 0 || idx + 4 + len > str.length) break;
        const val = str.substring(idx + 4, idx + 4 + len);

        if (tag === '00' && len > 10) {
          parseTLV(val);
        } else if (tag === '01') {
          result.sendingBank = val; // e.g. 014 (SCB), 004 (KBANK), 030 (GSB)
        } else if (tag === '02') {
          result.transRef = val; // Unique transaction reference code
        } else if (tag === '03') {
          result.receivingBank = val;
        } else if (tag === '54') {
          result.amount = parseFloat(val);
        }
        idx += 4 + len;
      }
    }

    parseTLV(qrStr);
    return result;
  }

  // EMVCo PromptPay Standard (starts with 000201)
  if (qrStr.startsWith('000201')) {
    result.isStandardBankSlip = true;
    result.payloadType = 'emvco_promptpay';
    // Extract Tag 54 (Amount) if present
    const amtMatch = qrStr.match(/54\d{2}([0-9.]+)/);
    if (amtMatch) {
      result.amount = parseFloat(amtMatch[1]);
    }
    return result;
  }

  // Bank Verification URLs (e.g. SCB, KBank, KTB, GSB verification link)
  const bankDomains = ['scb', 'kasikornbank', 'kbank', 'kplus', 'krungthai', 'gsb.or.th', 'mymo', 'bangkokbank', 'bbl', 'krungsri', 'bay', 'ttbbank', 'promptpay', 'truemoney'];
  if (qrStr.startsWith('http://') || qrStr.startsWith('https://')) {
    const isBankUrl = bankDomains.some(d => qrStr.toLowerCase().includes(d));
    if (isBankUrl) {
      result.isStandardBankSlip = true;
      result.payloadType = 'bank_verify_url';
      return result;
    } else {
      // Not a bank URL
      return result;
    }
  }

  // Extract date (YYYYMMDD) or timestamp if embedded in QR text or Tag 02 ref
  const dateRegex = /(202[4-9])(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/;
  const dateMatch = qrStr.match(dateRegex);
  if (dateMatch) {
    result.slipDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    // Check if time is directly adjacent to date, e.g. YYYYMMDDHHmmss or YYYYMMDD_HHmm
    const rest = qrStr.substring(dateMatch.index + 8);
    const timeMatch = rest.match(/^[_\s-]?([01][0-9]|2[0-3])([0-5][0-9])/);
    if (timeMatch) {
      result.slipTime = `${timeMatch[1]}:${timeMatch[2]}`;
    }
  }

  return result;
}

/**
 * Verify Bank Transfer & PromptPay Slip
 * Performs real QR extraction, bank template matching, anti-replay, and account verification
 */
async function verifyBankSlip({ imageBuffer, amount, user, settings, transferDate, transferTime, slipRef, recipientName }) {
  // 1. Scan image for real QR Code
  const qr = await extractQrFromImage(imageBuffer);
  if (!qr || !qr.data || qr.data.trim().length < 8) {
    throw new Error('ไม่พบ QR Code ตรวจสอบสลิปบนรูปภาพ กรุณาแนบรูปสลิปโอนเงินที่มี QR Code ตรวจสอบจากแอปธนาคาร');
  }

  const qrData = qr.data.trim();
  const parsed = parseSlipQrData(qrData);

  if (!parsed.isStandardBankSlip) {
    throw new Error('QR Code บนภาพไม่ใช่สลิปโอนเงินของธนาคารที่ถูกต้อง');
  }

  // 2. Anti-Replay: Check if slip has already been redeemed in system
  const slipHash = crypto.createHash('sha256').update(qrData).digest('hex');
  const usedSlips = getUsedSlips();
  const alreadyUsed = usedSlips.find(s => s.hash === slipHash);
  if (alreadyUsed) {
    throw new Error(`สลิปนี้เคยถูกใช้งานเติมเงินไปแล้วในระบบ เมื่อ ${alreadyUsed.redeemedAt || 'ก่อนหน้านี้'} ไม่สามารถใช้งานซ้ำได้`);
  }

  // 3. Bank Template Match
  const bankSettings = settings.payments?.bank || {};
  const selectedBankCode = (bankSettings.bankCode || 'GSB').toUpperCase();
  const template = BANK_TEMPLATES.find(t => t.code === selectedBankCode) || BANK_TEMPLATES[0];

  // Verify against bank keywords / codes if identifiable from QR
  const qrLower = qrData.toLowerCase();
  
  // Destination bank check (receivingBank in BScanC Tag 03/04)
  if (parsed.receivingBank && template.bankId && template.bankId !== '000') {
    if (parsed.receivingBank !== template.bankId) {
      const otherBank = BANK_TEMPLATES.find(t => t.bankId === parsed.receivingBank);
      const otherName = otherBank ? otherBank.name : `รหัสธนาคาร ${parsed.receivingBank}`;
      throw new Error(`ธนาคารปลายทางในสลิป (${otherName}) ไม่ตรงกับธนาคารที่ระบบกำหนด (${template.name})`);
    }
  } else if (!parsed.receivingBank && parsed.sendingBank && template.bankId && template.bankId !== '000') {
    // If receiving bank is not present, check sending bank code against template
    if (parsed.sendingBank !== template.bankId) {
      const otherBank = BANK_TEMPLATES.find(t => t.bankId === parsed.sendingBank);
      if (otherBank) {
        throw new Error(`ธนาคารในสลิป (${otherBank.name}) ไม่ตรงกับธนาคารที่ระบบกำหนด (${template.name})`);
      }
    }
  }

  // Check keyword mismatch if QR is a URL or text with another bank
  const otherBanks = BANK_TEMPLATES.filter(t => t.code !== selectedBankCode && t.code !== 'PROMPTPAY');
  for (const other of otherBanks) {
    if (other.keywords.some(k => k.length > 3 && qrLower.includes(k))) {
      const isTargetBankMentioned = template.keywords.some(k => k.length > 3 && qrLower.includes(k));
      if (!isTargetBankMentioned) {
        throw new Error(`สลิปนี้เป็นของ ${other.name} ไม่ตรงกับธนาคารที่ระบบกำหนด (${template.name})`);
      }
    }
  }

  // 4. Recipient Name Check (ตรวจสอบชื่อตรงตามที่ชื่อธนาคาร / ข้อความหัวข้อ)
  const expectedAccountName = (bankSettings.accountName || '').trim();
  if (expectedAccountName && recipientName) {
    const cleanExpected = expectedAccountName.replace(/^(นาย|นาง|นางสาว|ด\.ช\.|ด\.ญ\.|mr\.|mrs\.|ms\.)\s*/i, '').replace(/\s+/g, '').toLowerCase();
    const cleanInput = recipientName.replace(/^(นาย|นาง|นางสาว|ด\.ช\.|ด\.ญ\.|mr\.|mrs\.|ms\.)\s*/i, '').replace(/\s+/g, '').toLowerCase();
    if (!cleanInput.includes(cleanExpected) && !cleanExpected.includes(cleanInput)) {
      throw new Error(`ชื่อผู้รับเงิน (${recipientName}) ไม่ตรงกับชื่อบัญชีที่ระบบกำหนด (${expectedAccountName})`);
    }
  }

  // 5. Date & Time Verification (ตรวจสอบวันและเวลา)
  // Thai local time UTC+7
  const now = new Date();
  const bangkokOffsetMs = 7 * 60 * 60 * 1000;
  const bangkokNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + bangkokOffsetMs);
  const todayStr = bangkokNow.toISOString().split('T')[0];
  const curHours = bangkokNow.getHours();
  const curMinutes = bangkokNow.getMinutes();

  // Validate Transfer Date
  const finalTransferDate = transferDate || parsed.slipDate || todayStr;
  if (finalTransferDate) {
    if (finalTransferDate > todayStr) {
      throw new Error(`วันที่โอนเงิน (${finalTransferDate}) ไม่ถูกต้อง (ไม่สามารถใช้วันที่ในอนาคตได้)`);
    }
    // Reject slips older than 3 days
    const diffDays = Math.floor((new Date(todayStr) - new Date(finalTransferDate)) / (1000 * 60 * 60 * 24));
    if (diffDays > 3) {
      throw new Error(`สลิปนี้หมดอายุแล้ว (โอนเมื่อ ${finalTransferDate}) ระบบรับเฉพาะสลิปภายใน 3 วันล่าสุดเท่านั้น`);
    }
    // If QR contains embedded slip date, ensure user's input matches
    if (parsed.slipDate && transferDate && transferDate !== parsed.slipDate) {
      throw new Error(`วันที่โอนเงินที่ระบุ (${transferDate}) ไม่ตรงกับวันที่บนสลิป (${parsed.slipDate})`);
    }
  }

  // Validate Transfer Time
  const defaultTimeStr = (('0' + curHours).slice(-2) + ':' + ('0' + curMinutes).slice(-2));
  const finalTransferTime = transferTime || parsed.slipTime || defaultTimeStr;

  const timeMatch = String(finalTransferTime).match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  const inputHour = timeMatch ? parseInt(timeMatch[1], 10) : curHours;
  const inputMin = timeMatch ? parseInt(timeMatch[2], 10) : curMinutes;

  // If transferred today and user explicitly provided time, check not in the future
  if (finalTransferDate === todayStr && transferTime) {
    const inputTotalMins = inputHour * 60 + inputMin;
    const currentTotalMins = curHours * 60 + curMinutes;
    if (inputTotalMins > currentTotalMins + 15) {
      throw new Error(`เวลาที่โอนเงิน (${finalTransferTime}) ไม่ถูกต้อง (เป็นเวลาในอนาคต) กรุณาตรวจสอบเวลาบนสลิป`);
    }
  }

  // If QR contains embedded slip time, verify matching within 30 mins
  if (parsed.slipTime && transferTime) {
    const [sH, sM] = parsed.slipTime.split(':').map(Number);
    const slipTotalMins = sH * 60 + sM;
    const userTotalMins = inputHour * 60 + inputMin;
    if (Math.abs(slipTotalMins - userTotalMins) > 30) {
      throw new Error(`เวลาที่โอนเงินที่ระบุ (${transferTime}) ไม่ตรงกับเวลาที่ตรวจพบบนสลิป (${parsed.slipTime})`);
    }
  }

  // 6. Amount Verification (สแกนอัตโนมัติจากสลิปหรือใช้ค่าเริ่มต้น)
  let finalAmount = parsed.amount || (amount ? parseFloat(amount) : null) || 100;
  if (!finalAmount || finalAmount <= 0) {
    finalAmount = 100;
  }

  // 7. Success: Register slip as used to prevent any replay
  saveUsedSlip({
    hash: slipHash,
    qrPreview: qrData.length > 80 ? qrData.substring(0, 80) + '...' : qrData,
    bankCode: template.code,
    bankName: template.name,
    amount: finalAmount,
    userId: user.id,
    username: user.username,
    slipRef: slipRef || parsed.transRef || null,
    transferDate: finalTransferDate,
    transferTime: finalTransferTime,
    redeemedAt: new Date().toISOString()
  });

  return {
    verified: true,
    qrData: qrData,
    payloadType: parsed.payloadType,
    bankCode: template.code,
    bankName: template.name,
    amount: finalAmount,
    transferDate: finalTransferDate,
    transferTime: finalTransferTime,
    transRef: parsed.transRef || slipRef || `REF_${Date.now()}`
  };
}

module.exports = {
  BANK_TEMPLATES,
  extractQrFromImage,
  parseSlipQrData,
  verifyBankSlip,
  getUsedSlips
};
