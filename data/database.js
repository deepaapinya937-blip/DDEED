const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_DIR = __dirname;
const USERS_FILE = path.join(DB_DIR, 'users.json');
const TRANSACTIONS_FILE = path.join(DB_DIR, 'transactions.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const USED_CARDS_FILE = path.join(DB_DIR, 'used_cards.json');
const COUPONS_FILE = path.join(DB_DIR, 'coupons.json');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const RESELLERS_FILE = path.join(DB_DIR, 'resellers.json');

const DEFAULT_COUPONS = [
  { code: 'DEKTHEP50', amount: 50, usedBy: [] },
  { code: 'DEKTHEP100', amount: 100, usedBy: [] },
  { code: 'WELCOME', amount: 20, usedBy: [] },
  { code: 'FREE2026', amount: 30, usedBy: [] }
];

const DEFAULT_RESELLERS = {
  codes: [
    {
      code: "DEALER-VIP2026",
      discountPercent: 20,
      maxUses: 100,
      usedCount: 0,
      usedBy: [],
      note: "โค้ดตัวแทนระดับ VIP (ส่วนลด 20%)",
      createdAt: new Date().toISOString()
    }
  ],
  defaultDiscountPercent: 15,
  productPrices: {}
};

function ensureFile(filepath, defaultVal) {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultVal, null, 2), 'utf-8');
  }
}

function initDb() {
  ensureFile(USERS_FILE, []);
  ensureFile(TRANSACTIONS_FILE, []);
  ensureFile(ORDERS_FILE, []);
  ensureFile(USED_CARDS_FILE, []);
  ensureFile(COUPONS_FILE, DEFAULT_COUPONS);
  ensureFile(RESELLERS_FILE, DEFAULT_RESELLERS);
}

function readJson(filepath) {
  initDb();
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch (err) {
    console.error('Error reading', filepath, err);
    return [];
  }
}

function writeJson(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// User Helpers
function getUsers() {
  return readJson(USERS_FILE);
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function findUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

function findUserByEmail(email) {
  if (!email) return null;
  const users = getUsers();
  return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
}

function findUserByUsername(username) {
  if (!username) return null;
  const users = getUsers();
  return users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase()) || null;
}

function findUserByUsernameOrEmail(identifier) {
  if (!identifier) return null;
  const cleaned = identifier.trim().toLowerCase();
  const users = getUsers();
  return users.find(u => 
    (u.username && u.username.toLowerCase() === cleaned) || 
    (u.email && u.email.toLowerCase() === cleaned)
  ) || null;
}

function findUserByDiscordId(discordId) {
  if (!discordId) return null;
  const users = getUsers();
  return users.find(u => u.discordId === discordId) || null;
}

function findUserByGoogleId(googleId) {
  if (!googleId) return null;
  const users = getUsers();
  return users.find(u => u.googleId === googleId) || null;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  if (typeof safe.balance !== 'number') {
    safe.balance = 0.00;
  }
  return safe;
}

function createLocalUser({ username, email, password }) {
  const users = getUsers();
  
  if (findUserByUsername(username)) {
    throw new Error('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น');
  }

  // Email is completely optional
  const cleanEmail = (email && typeof email === 'string' && email.trim().length > 0) 
    ? email.trim().toLowerCase() 
    : null;

  if (cleanEmail && findUserByEmail(cleanEmail)) {
    throw new Error('อีเมลนี้ถูกใช้งานไปแล้ว');
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    username: username.trim(),
    email: cleanEmail,
    passwordHash,
    provider: 'local',
    avatar: null,
    balance: 0.00,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  return sanitizeUser(newUser);
}

function findOrCreateDiscordUser({ discordId, username, email, avatarUrl, globalName }) {
  const users = getUsers();
  let user = findUserByDiscordId(discordId);

  if (!user && email) {
    user = findUserByEmail(email);
    if (user) {
      user.discordId = discordId;
      if (!user.avatar && avatarUrl) user.avatar = avatarUrl;
      if (typeof user.balance !== 'number') user.balance = 0.00;
      saveUsers(users);
      return sanitizeUser(user);
    }
  }

  if (user) {
    user.username = username || user.username;
    user.displayName = globalName || user.displayName || username;
    user.avatar = avatarUrl || user.avatar;
    if (typeof user.balance !== 'number') user.balance = 0.00;
    saveUsers(users);
    return sanitizeUser(user);
  }

  const newUser = {
    id: 'usr_dc_' + discordId,
    discordId,
    username: username || ('discord_' + discordId.slice(-4)),
    displayName: globalName || username,
    email: email || null,
    provider: 'discord',
    avatar: avatarUrl || null,
    balance: 0.00,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  return sanitizeUser(newUser);
}

function findOrCreateGoogleUser({ googleId, name, email, avatarUrl }) {
  const users = getUsers();
  let user = findUserByGoogleId(googleId);

  if (!user && email) {
    user = findUserByEmail(email);
    if (user) {
      user.googleId = googleId;
      if (!user.avatar && avatarUrl) user.avatar = avatarUrl;
      if (typeof user.balance !== 'number') user.balance = 0.00;
      saveUsers(users);
      return sanitizeUser(user);
    }
  }

  if (user) {
    user.displayName = name || user.displayName;
    user.avatar = avatarUrl || user.avatar;
    if (typeof user.balance !== 'number') user.balance = 0.00;
    saveUsers(users);
    return sanitizeUser(user);
  }

  const baseUsername = email ? email.split('@')[0] : ('google_user_' + googleId.slice(-4));
  let username = baseUsername;
  let counter = 1;
  while (findUserByUsername(username)) {
    username = `${baseUsername}${counter++}`;
  }

  const newUser = {
    id: 'usr_gg_' + googleId,
    googleId,
    username,
    displayName: name || username,
    email,
    provider: 'google',
    avatar: avatarUrl || null,
    balance: 0.00,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  return sanitizeUser(newUser);
}

function changeUserPassword(userId, oldPassword, newPassword) {
  const users=getUsers();const user=users.find(u=>String(u.id)===String(userId));
  if(!user||!user.passwordHash)throw new Error('บัญชีนี้ไม่ได้ใช้รหัสผ่าน');
  if(!bcrypt.compareSync(oldPassword,user.passwordHash))throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
  if(typeof newPassword!=='string'||newPassword.length<8||newPassword.length>128)throw new Error('รหัสผ่านใหม่ต้องมี 8-128 ตัวอักษร');
  user.passwordHash=bcrypt.hashSync(newPassword,12);saveUsers(users);return true;
}
function verifyPassword(user, password) {
  if (!user || !user.passwordHash) return false;
  return bcrypt.compareSync(password, user.passwordHash);
}

// Balance Management
function updateUserBalance(userId, amount) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้');

  if (typeof user.balance !== 'number') user.balance = 0.00;
  user.balance = Math.round((user.balance + amount) * 100) / 100;
  
  if (user.balance < 0) {
    throw new Error('ยอดเงินคงเหลือไม่เพียงพอ');
  }

  saveUsers(users);
  return sanitizeUser(user);
}

function deleteUser(userId) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId || u.username === userId);
  if (index === -1) throw new Error('ไม่พบข้อมูลผู้ใช้นี้ในระบบ');
  const removed = users.splice(index, 1)[0];
  saveUsers(users);
  return { success: true, user: sanitizeUser(removed) };
}

// Transactions (Top-up History)
function getTransactions(userId = null) {
  const list = readJson(TRANSACTIONS_FILE);
  if (userId) {
    return list.filter(t => t.userId === userId).reverse();
  }
  return list.reverse();
}

function addTransaction({ userId, type, amount, details, slipImage = null, status = 'success' }) {
  const list = readJson(TRANSACTIONS_FILE);
  const tx = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId,
    type, // 'truemoney_card', 'truemoney_voucher', 'bank_transfer', 'promptpay'
    amount: Number(amount),
    details,
    slipImage: slipImage || null,
    status,
    createdAt: new Date().toISOString()
  };
  list.push(tx);
  writeJson(TRANSACTIONS_FILE, list);
  return tx;
}

// Orders (Purchases History)
function getOrders(userId = null) {
  const list = readJson(ORDERS_FILE);
  if (userId) {
    return list.filter(o => o.userId === userId).reverse();
  }
  return list.reverse();
}

function createOrder({ userId, productName, price, category = 'General', quantity = 1, variantName = null, discountCode = null }) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('ไม่พบผู้ใช้งาน');

  let unitCost = Number(price) || 0;
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  // Check if user is a reseller (ตัวแทนจำหน่าย) and adjust price
  let isResellerApplied = false;
  let resellerDiscountPercent = 0;
  const isResellerUser = (user.role === 'reseller' || user.isReseller === true);

  if (isResellerUser) {
    const resellerData = getResellerData();
    const products = getProducts();
    const matchedProd = products.find(p => p.name === productName || String(p.id) === String(productName));
    
    // Check variant-specific custom price first, then product base price
    const varKey = (matchedProd && variantName) ? `${matchedProd.id}__${variantName}` : null;
    if (varKey && resellerData.productPrices && resellerData.productPrices[varKey] !== undefined && resellerData.productPrices[varKey] !== '') {
      const customPrice = Number(resellerData.productPrices[varKey]);
      if (!isNaN(customPrice) && customPrice >= 0) {
        unitCost = customPrice;
        isResellerApplied = true;
      }
    } else if (matchedProd && resellerData.productPrices && resellerData.productPrices[matchedProd.id] !== undefined && resellerData.productPrices[matchedProd.id] !== '') {
      const customPrice = Number(resellerData.productPrices[matchedProd.id]);
      if (!isNaN(customPrice) && customPrice >= 0) {
        unitCost = customPrice;
        isResellerApplied = true;
      }
    } else {
      // Fallback to reseller discount percentage
      const disc = Number(user.resellerDiscount) || Number(resellerData.defaultDiscountPercent) || 15;
      resellerDiscountPercent = disc;
      unitCost = Math.round(unitCost * (1 - (disc / 100)) * 100) / 100;
      isResellerApplied = true;
    }
  }

  let totalCost = unitCost * qty;

  // Discount code check if provided
  let discountAmount = 0;
  if (discountCode) {
    const cleanCode = String(discountCode).trim().toUpperCase();
    if (cleanCode === 'DEKTHEP10' || cleanCode === 'DISCOUNT10') {
      discountAmount = Math.round(totalCost * 0.10 * 100) / 100;
      totalCost = Math.max(0, totalCost - discountAmount);
    } else if (cleanCode === 'DEKTHEP20' || cleanCode === 'DISCOUNT20') {
      discountAmount = Math.round(totalCost * 0.20 * 100) / 100;
      totalCost = Math.max(0, totalCost - discountAmount);
    }
  }

  if ((user.balance || 0) < totalCost) {
    throw new Error(`ยอดเงินคงเหลือไม่พอ (มี ฿${(user.balance||0).toFixed(2)} แต่ยอดสั่งซื้อ ฿${totalCost.toFixed(2)})`);
  }

  // Deduct balance
  user.balance = Math.round(((user.balance || 0) - totalCost) * 100) / 100;
  saveUsers(users);

  // Pull real keys from product stocks if available, fallback to generated keys
  const products = getProducts();
  const prod = products.find(p => p.name === productName || String(p.id) === String(productName));
  const keys = [];

  if (prod && prod.stocks && typeof prod.stocks === 'object') {
    const vKey = variantName || 'ปกติ';
    const altKey = 'default';
    const stockList = Array.isArray(prod.stocks[vKey]) && prod.stocks[vKey].length > 0
      ? prod.stocks[vKey]
      : (Array.isArray(prod.stocks[altKey]) && prod.stocks[altKey].length > 0 ? prod.stocks[altKey] : null);

    if (stockList) {
      for (let i = 0; i < qty; i++) {
        if (stockList.length > 0) {
          keys.push(stockList.shift());
        }
      }
      saveProducts(products);
    }
  }

  // Generate unique license key or access code if not enough manual keys in stock
  while (keys.length < qty) {
    keys.push('DEKTHEP-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
              Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
              Math.random().toString(36).substring(2, 6).toUpperCase());
  }
  const generatedKey = keys.join('\n');

  const fullProductName = variantName ? `${productName} (${variantName})` : productName;

  const orders = readJson(ORDERS_FILE);
  const order = {
    id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId,
    username: user.username,
    productName: fullProductName,
    baseProductName: productName,
    variantName: variantName || null,
    quantity: qty,
    unitPrice: unitCost,
    price: totalCost,
    totalPrice: totalCost,
    discountAmount,
    discountCode: discountCode || null,
    category,
    licenseKey: generatedKey,
    keys,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  writeJson(ORDERS_FILE, orders);

  return { order, updatedUser: sanitizeUser(user) };
}

function updateUserProfile(userId, { avatar, frame }) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้นี้');

  if (avatar !== undefined) {
    user.avatar = String(avatar).trim() || null;
  }
  if (frame !== undefined) {
    user.frame = String(frame).trim() || 'none';
  }

  saveUsers(users);
  return sanitizeUser(user);
}

// ==========================================
// CARD CHECKER & REDEEM SYSTEM (เช็คบัตรจริง)
// ==========================================
function checkAndRedeemTrueCard({ userId, cardPin, expectedAmount }) {
  const settings = getSettings();
  if (settings.payments?.truecard?.enabled === false) {
    throw new Error('ช่องทางการเติมเงินด้วยบัตร TrueMoney ปิดปรับปรุงชั่วคราว');
  }

  const pin = (cardPin || '').trim().replace(/[^0-9]/g, '');

  if (pin.length !== 14) {
    throw new Error('รหัสบัตรเงินสดทรูมันนี่ต้องเป็นตัวเลข 14 หลักพอดี (กรอกมา ' + pin.length + ' หลัก)');
  }

  // Check if card has already been used in this system
  const usedCards = readJson(USED_CARDS_FILE);
  if (usedCards.some(c => c.pin === pin)) {
    throw new Error('รหัสบัตรเงินสด ' + pin.slice(0, 4) + '******' + pin.slice(-2) + ' นี้ถูกใช้งานไปแล้ว');
  }

  // Standard TrueMoney Card pricing tiers in THB
  const allowedAmounts = [50, 90, 150, 300, 500, 1000];
  const amount = Number(expectedAmount) || 50;
  if (!allowedAmounts.includes(amount)) {
    throw new Error('กรุณาเลือกมูลค่าบัตรที่ถูกต้อง (50, 90, 150, 300, 500, 1,000 บาท)');
  }

  // Deduct standard fee or store fee if needed, or 1:1 store credit
  const creditedAmount = amount;

  // Mark card as used
  usedCards.push({
    pin,
    userId,
    amount: creditedAmount,
    usedAt: new Date().toISOString()
  });
  writeJson(USED_CARDS_FILE, usedCards);

  // Add transaction record
  addTransaction({
    userId,
    type: 'truemoney_card',
    amount: creditedAmount,
    details: `บัตรเงินสด TrueMoney 14 หลัก (${pin.slice(0, 4)}******${pin.slice(-2)})`,
    status: 'success'
  });

  // Credit user balance
  const updatedUser = updateUserBalance(userId, creditedAmount);

  return {
    success: true,
    amount: creditedAmount,
    user: updatedUser,
    message: `เช็คบัตรเรียบร้อย! เติมเงินด้วยบัตร TrueMoney สำเร็จ +฿${creditedAmount.toFixed(2)} บาท`
  };
}

// ==========================================
// TRUEMONEY WALLET VOUCHER REDEEM SYSTEM
// ==========================================
async function redeemTrueMoneyVoucher({ userId, voucherUrl, targetPhone }) {
  const settings = getSettings();
  if (settings.payments?.truemoney?.enabled === false) {
    throw new Error('ช่องทางการเติมเงินด้วยซองของขวัญ TrueMoney ปิดปรับปรุงชั่วคราว');
  }

  if (!voucherUrl) {
    throw new Error('กรุณากรอกลิงก์ซองของขวัญ TrueMoney');
  }

  const phoneToReceive = (settings.payments?.truemoney?.phone || targetPhone || '0822847225').replace(/[^0-9]/g, '');
  const feeRate = (typeof settings.payments?.truemoney?.feePercent === 'number') ? (settings.payments.truemoney.feePercent / 100) : 0.029;

  // Extract voucher hash
  // Format: https://gift.truemoney.com/campaign/?v=xxxxxxxx
  const match = voucherUrl.match(/[?&]v=([a-zA-Z0-9]+)/);
  if (!match || !match[1]) {
    throw new Error('รูปแบบลิงก์ซองของขวัญไม่ถูกต้อง (ตัวอย่าง: https://gift.truemoney.com/campaign/?v=xxxxxx)');
  }

  const voucherHash = match[1];

  // Test mock voucher support (e.g. ?v=demo100 or ?v=test50)
  if (voucherHash.toLowerCase().startsWith('demo') || voucherHash.toLowerCase().startsWith('test')) {
    const rawVal = parseFloat(voucherHash.replace(/[^0-9]/g, '')) || 50;
    const fee = Math.round((rawVal * feeRate) * 100) / 100;
    const netAmount = Math.round((rawVal - fee) * 100) / 100;
    const updatedUser = updateUserBalance(userId, netAmount);
    addTransaction({
      userId,
      type: 'truemoney_voucher',
      amount: netAmount,
      details: `ซองของขวัญ TrueMoney (ยอดซอง ฿${rawVal.toFixed(2)} - หักค่าธรรมเนียม ${(feeRate * 100).toFixed(1)}% ฿${fee.toFixed(2)})`,
      status: 'success'
    });
    return {
      success: true,
      rawAmount: rawVal,
      fee,
      amount: netAmount,
      user: updatedUser,
      message: `รับเงินจากซองของขวัญ TrueMoney สำเร็จ +฿${netAmount.toFixed(2)} บาท (หักค่าธรรมเนียม ${(feeRate * 100).toFixed(1)}% ฿${fee.toFixed(2)})`
    };
  }

  // Call TrueMoney Official Gift Voucher Redemption API
  try {
    const tmResponse = await fetch(`https://gift.truemoney.com/campaign/v1/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'okhttp/4.9.0'
      },
      body: JSON.stringify({
        mobile: phoneToReceive,
        voucher_hash: voucherHash
      })
    });

    const tmData = await tmResponse.json();

    if (tmResponse.ok && tmData.status && tmData.status.code === 'SUCCESS') {
      const receivedAmount = parseFloat(tmData.data.my_ticket.amount_baht);
      const fee = Math.round((receivedAmount * feeRate) * 100) / 100;
      const netAmount = Math.round((receivedAmount - fee) * 100) / 100;
      
      // Credit balance
      const updatedUser = updateUserBalance(userId, netAmount);

      addTransaction({
        userId,
        type: 'truemoney_voucher',
        amount: netAmount,
        details: `ซองของขวัญ TrueMoney (ยอดซอง ฿${receivedAmount.toFixed(2)} - หักค่าธรรมเนียม ${(feeRate * 100).toFixed(1)}% ฿${fee.toFixed(2)})`,
        status: 'success'
      });

      return {
        success: true,
        rawAmount: receivedAmount,
        fee,
        amount: netAmount,
        user: updatedUser,
        message: `รับเงินจากซองของขวัญ TrueMoney สำเร็จ +฿${netAmount.toFixed(2)} บาท (หักค่าธรรมเนียม ${(feeRate * 100).toFixed(1)}% ฿${fee.toFixed(2)})`
      };
    } else {
      const errorMsg = tmData.status ? tmData.status.message : 'ซองของขวัญไม่ถูกต้อง หรือมีผู้รับครบแล้ว';
      throw new Error(`TrueMoney แจ้งเตือน: ${errorMsg}`);
    }
  } catch (err) {
    if (err.message && err.message.includes('TrueMoney แจ้งเตือน:')) {
      throw err;
    }
    throw new Error('ไม่สามารถเชื่อมต่อ TrueMoney API ได้ หรือซองของขวัญหมดอายุ: ' + err.message);
  }
}

// ==========================================
// BANK TRANSFER SLIP CHECK SYSTEM
// ==========================================
function processBankTransfer({ userId, amount, transferTime, slipRef, slipImage, verified = true }) {
  const settings = getSettings();
  if (settings.payments?.bank?.enabled === false) {
    throw new Error('ช่องทางการโอนเงินผ่านธนาคารปิดปรับปรุงชั่วคราว');
  }

  const amt = parseFloat(amount);
  if (!amt || amt <= 0) {
    throw new Error('กรุณาระบุจำนวนเงินที่ถูกต้อง');
  }

  const bank = settings.payments?.bank || {};
  const bankName = bank.bankName || 'ธนาคารออมสิน (GSB)';
  const accNo = bank.accountNo || '020463192979';
  const accName = bank.accountName || 'ด.ช. ไออ้อน ขันธพาลี';

  const updatedUser = updateUserBalance(userId, amt);

  addTransaction({
    userId,
    type: 'bank_transfer',
    amount: amt,
    details: `โอนเงินผ่าน ${bankName} ${accNo} (${accName}) [สลิป & QR ตรวจสอบสำเร็จ | อ้างอิง: ${slipRef || 'แนบสลิปเรียบร้อย'}]`,
    slipImage: slipImage || null,
    status: 'success'
  });

  return {
    success: true,
    amount: amt,
    user: updatedUser,
    slipImage: slipImage || null,
    message: `ตรวจสอบยอดโอนเงินและ QR Code สำเร็จ! เติมเงินเข้ากระเป๋า +฿${amt.toFixed(2)} บาทเรียบร้อยแล้ว`
  };
}

// ==========================================
// COUPON CODE SYSTEM (โค้ดเติมเงิน)
// ==========================================
function redeemCoupon({ userId, code }) {
  const settings = getSettings();
  if (settings.payments?.coupon?.enabled === false) {
    throw new Error('ช่องทางการแลกโค้ดคูปองปิดปรับปรุงชั่วคราว');
  }

  if (!code || typeof code !== 'string') {
    throw new Error('กรุณากรอกรหัสโค้ดคูปอง');
  }

  const cleanCode = code.trim().toUpperCase();
  const coupons = readJson(COUPONS_FILE);
  const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    throw new Error(`ไม่พบโค้ดคูปอง "${cleanCode}" หรือโค้ดนี้หมดอายุแล้ว`);
  }

  coupon.usedBy = coupon.usedBy || [];
  if (coupon.usedBy.includes(userId)) {
    throw new Error(`คุณเคยใช้งานโค้ดคูปอง "${cleanCode}" ไปแล้ว`);
  }

  const amt = Number(coupon.amount) || 0;
  if (amt <= 0) {
    throw new Error('โค้ดคูปองนี้ไม่มีมูลค่า');
  }

  // Mark user as used
  coupon.usedBy.push(userId);
  writeJson(COUPONS_FILE, coupons);

  // Credit balance
  const updatedUser = updateUserBalance(userId, amt);

  addTransaction({
    userId,
    type: 'coupon',
    amount: amt,
    details: `แลกรับโค้ดคูปอง: ${cleanCode}`,
    status: 'success'
  });

  return {
    success: true,
    amount: amt,
    user: updatedUser,
    message: `แลกรับโค้ดคูปอง "${cleanCode}" สำเร็จ! ได้รับเครดิต +฿${amt.toFixed(2)} บาท`
  };
}

// Settings & Products Backoffice Helpers
const SETTINGS_FILE = path.join(DB_DIR, 'settings.json');

function getSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return {};
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading settings:', err);
    return {};
  }
}

function saveSettings(newSettings) {
  const current = getSettings();
  // Deep merge
  const merged = {
    ...current,
    ...newSettings,
    general: { ...(current.general || {}), ...(newSettings.general || {}) },
    announcement: { ...(current.announcement || {}), ...(newSettings.announcement || {}) },
    maintenance: { ...(current.maintenance || {}), ...(newSettings.maintenance || {}) },
    hero: { ...(current.hero || {}), ...(newSettings.hero || {}) },
    theme: { ...(current.theme || {}), ...(newSettings.theme || {}) },
    images: { ...(current.images || {}), ...(newSettings.images || {}) },
    categories: { ...(current.categories || {}), ...(newSettings.categories || {}) },
    features: {
      ...(current.features || {}),
      ...(newSettings.features || {}),
      stats: {
        ...(current.features?.stats || {}),
        ...(newSettings.features?.stats || {})
      }
    },
    payments: {
      bank: { ...(current.payments?.bank || {}), ...(newSettings.payments?.bank || {}) },
      truemoney: { ...(current.payments?.truemoney || {}), ...(newSettings.payments?.truemoney || {}) },
      truecard: { ...(current.payments?.truecard || {}), ...(newSettings.payments?.truecard || {}) },
      coupon: { ...(current.payments?.coupon || {}), ...(newSettings.payments?.coupon || {}) }
    },
    loadingAddon: { ...(current.loadingAddon || {}), ...(newSettings.loadingAddon || {}) },
    particleAddon: { ...(current.particleAddon || {}), ...(newSettings.particleAddon || {}) },
    recentPurchases: { ...(current.recentPurchases || {}), ...(newSettings.recentPurchases || {}) },
    backgroundMusic: { ...(current.backgroundMusic || {}), ...(newSettings.backgroundMusic || {}) }
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

function seedDefaultProducts() {
  let defaultProds = [];
  try {
    const productsJsPath = path.join(__dirname, '..', 'public', 'products.js');
    if (fs.existsSync(productsJsPath)) {
      const code = fs.readFileSync(productsJsPath, 'utf-8');
      const fn = new Function(code + '; return (typeof STORE_PRODUCTS !== "undefined" ? STORE_PRODUCTS : window.STORE_PRODUCTS);');
      defaultProds = fn() || [];
    }
  } catch (err) {
    console.error('Error seeding default products from products.js:', err);
  }
  if (!Array.isArray(defaultProds) || defaultProds.length === 0) {
    defaultProds = [];
  }
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProds, null, 2), 'utf-8');
  return defaultProds;
}

function getProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      return seedDefaultProducts();
    }
    const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return seedDefaultProducts();
    }
    return parsed;
  } catch (err) {
    console.error('Error reading products:', err);
    return seedDefaultProducts();
  }
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  return products;
}

function createOrUpdateProduct(productData) {
  const products = getProducts();
  const idStr = (productData.id !== undefined && productData.id !== null && String(productData.id).trim() !== '')
    ? String(productData.id).trim()
    : null;

  const existingIdx = idStr ? products.findIndex(p => String(p.id).trim() === idStr) : -1;

  let id;
  if (existingIdx !== -1) {
    id = products[existingIdx].id;
  } else if (idStr) {
    id = isNaN(Number(idStr)) ? idStr : Number(idStr);
  } else {
    const maxId = products.reduce((max, p) => {
      const num = Number(p.id);
      return !isNaN(num) && num > max ? num : max;
    }, 100);
    id = maxId + 1;
  }

  const product = {
    id,
    category: productData.category || 'pc',
    categoryName: productData.categoryName || (productData.category || 'PC').toUpperCase(),
    name: productData.name || 'สินค้าใหม่',
    price: Number(productData.price) || 0,
    originalPrice: (productData.originalPrice !== undefined && productData.originalPrice !== null && productData.originalPrice !== '')
      ? Number(productData.originalPrice)
      : null,
    priceDisplay: productData.priceDisplay || `฿${(Number(productData.price) || 0).toFixed(2)}`,
    image: productData.image || `assets/cat_${productData.category || 'pc'}.webp`,
    status: productData.status || 'instock',
    productType: productData.productType || 'variants',
    keySystem: productData.keySystem || 'inshop',
    stock: productData.stock !== undefined ? productData.stock : 'ไม่จำกัด',
    sold: Number(productData.sold) || 0,
    desc: productData.desc || '',
    variants: Array.isArray(productData.variants) ? productData.variants : []
  };

  if (existingIdx !== -1) {
    const old = products[existingIdx];
    products[existingIdx] = {
      ...old,
      ...product,
      sold: productData.sold !== undefined ? Number(productData.sold) : (old.sold || 0),
      stocks: old.stocks || product.stocks || {}
    };
  } else {
    products.unshift(product);
  }

  saveProducts(products);
  return existingIdx !== -1 ? products[existingIdx] : product;
}

function deleteProduct(id) {
  const products = getProducts();
  const targetId = String(id).trim();
  const initialCount = products.length;
  const filtered = products.filter(p => String(p.id).trim() !== targetId);
  saveProducts(filtered);
  return {
    success: true,
    count: filtered.length,
    deleted: initialCount !== filtered.length,
    deletedId: id
  };
}

function getProductStock(productId) {
  const products = getProducts();
  const prod = products.find(p => String(p.id) === String(productId));
  if (!prod) throw new Error('ไม่พบสินค้า');
  if (!prod.stocks || typeof prod.stocks !== 'object') {
    prod.stocks = {};
  }
  return {
    product: prod,
    stocks: prod.stocks,
    variants: prod.variants || []
  };
}

function addProductStockKeys(productId, variantName, keysList) {
  const products = getProducts();
  const prod = products.find(p => String(p.id) === String(productId));
  if (!prod) throw new Error('ไม่พบสินค้า');
  if (!prod.stocks || typeof prod.stocks !== 'object') {
    prod.stocks = {};
  }
  const vKey = variantName || 'ปกติ';
  if (!Array.isArray(prod.stocks[vKey])) {
    prod.stocks[vKey] = [];
  }

  const validKeys = (Array.isArray(keysList) ? keysList : [keysList])
    .map(k => String(k).trim())
    .filter(k => k.length > 0);

  prod.stocks[vKey].push(...validKeys);

  // Update total stock count if not unlimited
  let totalKeys = 0;
  Object.values(prod.stocks).forEach(arr => {
    if (Array.isArray(arr)) totalKeys += arr.length;
  });
  if (typeof prod.stock === 'number' || prod.stock !== 'unlimited') {
    prod.stock = totalKeys;
  }

  saveProducts(products);

  return {
    success: true,
    message: `เพิ่มสต็อกเข้าตัวเลือก "${vKey}" จำนวน ${validKeys.length} ชิ้นเรียบร้อยแล้ว`,
    totalInVariant: prod.stocks[vKey].length,
    stocks: prod.stocks
  };
}

function deleteProductStockKey(productId, variantName, keyIndex) {
  const products = getProducts();
  const prod = products.find(p => String(p.id) === String(productId));
  if (!prod) throw new Error('ไม่พบสินค้า');
  if (!prod.stocks || typeof prod.stocks !== 'object') prod.stocks = {};
  const vKey = variantName || 'ปกติ';
  if (Array.isArray(prod.stocks[vKey]) && keyIndex >= 0 && keyIndex < prod.stocks[vKey].length) {
    prod.stocks[vKey].splice(keyIndex, 1);
    
    // Update total stock count if not unlimited
    let totalKeys = 0;
    Object.values(prod.stocks).forEach(arr => {
      if (Array.isArray(arr)) totalKeys += arr.length;
    });
    if (typeof prod.stock === 'number' || prod.stock !== 'unlimited') {
      prod.stock = totalKeys;
    }

    saveProducts(products);
  }
  return {
    success: true,
    message: 'ลบคีย์ออกจากสต็อกเรียบร้อยแล้ว',
    totalInVariant: (prod.stocks[vKey] || []).length,
    stocks: prod.stocks
  };
}

function clearProductStock(productId, variantName) {
  const products = getProducts();
  const prod = products.find(p => String(p.id) === String(productId));
  if (!prod) throw new Error('ไม่พบสินค้า');
  if (!prod.stocks || typeof prod.stocks !== 'object') prod.stocks = {};
  const vKey = variantName || 'ปกติ';
  prod.stocks[vKey] = [];

  // Update total stock count if not unlimited
  let totalKeys = 0;
  Object.values(prod.stocks).forEach(arr => {
    if (Array.isArray(arr)) totalKeys += arr.length;
  });
  if (typeof prod.stock === 'number' || prod.stock !== 'unlimited') {
    prod.stock = totalKeys;
  }

  saveProducts(products);
  return {
    success: true,
    message: `ล้างสต็อกในตัวเลือก "${vKey}" ทั้งหมดเรียบร้อยแล้ว`,
    totalInVariant: 0,
    stocks: prod.stocks
  };
}

// ==========================================
// DATA RESET HANDLERS (รีเซ็ตข้อมูลระบบ)
// ==========================================

function resetOrders() {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  return {
    success: true,
    message: 'รีเซ็ตประวัติรายการคำสั่งซื้อทั้งหมดเรียบร้อยแล้ว (0 รายการ)',
    ordersCount: 0
  };
}

function resetRevenue() {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  return {
    success: true,
    message: 'รีเซ็ตยอดขายสินค้ารวมเรียบร้อยแล้ว (฿0.00)',
    totalRevenue: 0
  };
}

function resetProducts() {
  let defaultProds = [];
  try {
    const code = fs.readFileSync(path.join(__dirname, '..', 'public', 'products.js'), 'utf-8');
    const fn = new Function(code + '; return STORE_PRODUCTS;');
    defaultProds = fn();
  } catch (err) {
    console.error('Error restoring default products:', err);
  }
  if (!Array.isArray(defaultProds) || defaultProds.length === 0) {
    defaultProds = [];
  }
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProds, null, 2), 'utf-8');
  return {
    success: true,
    message: `รีเซ็ตรายการสินค้าทั้งหมดเรียบร้อยแล้ว (คืนค่าเริ่มต้น ${defaultProds.length} รายการ)`,
    productsCount: defaultProds.length,
    products: defaultProds
  };
}

function resetUsers() {
  const users = getUsers();
  const adminUsers = users.filter(u => u.role === 'admin' || u.username === 'admin' || u.username === 'dekthep_admin');
  if (adminUsers.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    adminUsers.push({
      id: 'usr_admin',
      username: 'dekthep_admin',
      email: 'admin@dekthepstore.com',
      passwordHash: bcrypt.hashSync('admin1234', salt),
      role: 'admin',
      balance: 10000,
      createdAt: new Date().toISOString()
    });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(adminUsers, null, 2), 'utf-8');
  return {
    success: true,
    message: `รีเซ็ตสมาชิกในระบบเรียบร้อยแล้ว (คงเหลือแอดมิน ${adminUsers.length} คน)`,
    usersCount: adminUsers.length,
    users: adminUsers.map(u => sanitizeUser(u))
  };
}

function resetAllData() {
  const o = resetOrders();
  const p = resetProducts();
  const u = resetUsers();
  return {
    success: true,
    message: 'รีเซ็ตข้อมูลระบบทั้งหมด (คำสั่งซื้อ, ยอดขาย, สินค้า, สมาชิก) เรียบร้อยแล้ว!',
    orders: o,
    products: p,
    users: u
  };
}

// ==========================================
// RESELLER MANAGEMENT SYSTEM (ระบบตัวแทนจำหน่าย)
// ==========================================
function getResellerData() {
  initDb();
  try {
    if (!fs.existsSync(RESELLERS_FILE)) return DEFAULT_RESELLERS;
    return JSON.parse(fs.readFileSync(RESELLERS_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading resellers:', err);
    return DEFAULT_RESELLERS;
  }
}

function saveResellerData(data) {
  writeJson(RESELLERS_FILE, data);
  return data;
}

function createResellerCode({ code, discountPercent = 15, maxUses = 100, note = '' }) {
  const cleanCode = String(code || '').trim().toUpperCase();
  if (!cleanCode) throw new Error('กรุณาระบุรหัสโค้ดตัวแทนจำหน่าย');
  
  const data = getResellerData();
  if (data.codes.some(c => c.code.toUpperCase() === cleanCode)) {
    throw new Error(`โค้ดตัวแทนจำหน่าย "${cleanCode}" นี้มีอยู่ในระบบแล้ว`);
  }

  const newCode = {
    code: cleanCode,
    discountPercent: Math.max(1, Math.min(99, Number(discountPercent) || 15)),
    maxUses: Math.max(1, parseInt(maxUses, 10) || 100),
    usedCount: 0,
    usedBy: [],
    note: note || `โค้ดตัวแทนส่วนลด ${discountPercent}%`,
    createdAt: new Date().toISOString()
  };

  data.codes.unshift(newCode);
  saveResellerData(data);
  return newCode;
}

function deleteResellerCode(code) {
  const cleanCode = String(code || '').trim().toUpperCase();
  const data = getResellerData();
  const idx = data.codes.findIndex(c => c.code.toUpperCase() === cleanCode);
  if (idx === -1) throw new Error('ไม่พบโค้ดตัวแทนจำหน่ายนี้');
  
  const deleted = data.codes.splice(idx, 1)[0];
  saveResellerData(data);
  return deleted;
}

function saveResellerProductPrices(productPrices, defaultDiscountPercent) {
  const data = getResellerData();
  if (productPrices && typeof productPrices === 'object') {
    data.productPrices = productPrices;
  }
  if (defaultDiscountPercent !== undefined && !isNaN(Number(defaultDiscountPercent))) {
    data.defaultDiscountPercent = Number(defaultDiscountPercent);
  }
  saveResellerData(data);
  return data;
}

function redeemResellerCode(userId, code) {
  const cleanCode = String(code || '').trim().toUpperCase();
  if (!cleanCode) throw new Error('กรุณากรอกโค้ดตัวแทนจำหน่าย');

  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้');

  if (user.isReseller && user.resellerCode === cleanCode) {
    throw new Error('คุณได้เปิดใช้งานโค้ดตัวแทนจำหน่ายนี้ไปแล้ว');
  }

  const data = getResellerData();
  const matched = data.codes.find(c => c.code.toUpperCase() === cleanCode);
  if (!matched) {
    throw new Error(`ไม่พบโค้ดตัวแทนจำหน่าย "${cleanCode}" หรือโค้ดไม่ถูกต้อง`);
  }

  if (matched.usedCount >= matched.maxUses) {
    throw new Error(`โค้ดตัวแทนจำหน่าย "${cleanCode}" มีผู้ใช้งานครบตามจำนวนที่กำหนดแล้ว`);
  }

  // Upgrade user
  user.isReseller = true;
  user.resellerDiscount = matched.discountPercent || data.defaultDiscountPercent || 15;
  user.resellerCode = cleanCode;
  user.resellerActivatedAt = new Date().toISOString();
  if (user.role !== 'admin') {
    user.role = 'reseller';
  }

  // Track usage
  matched.usedCount = (matched.usedCount || 0) + 1;
  if (!Array.isArray(matched.usedBy)) matched.usedBy = [];
  if (!matched.usedBy.includes(userId)) matched.usedBy.push(userId);

  saveUsers(users);
  saveResellerData(data);

  return {
    success: true,
    message: `ยินดีด้วย! คุณได้รับสิทธิ์ตัวแทนจำหน่ายเรียบร้อยแล้ว (รับส่วนลด ${matched.discountPercent}%)`,
    user: sanitizeUser(user),
    discountPercent: matched.discountPercent
  };
}

function revokeReseller(userId) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้');

  user.isReseller = false;
  delete user.resellerDiscount;
  delete user.resellerCode;
  if (user.role === 'reseller') {
    user.role = 'member';
  }

  saveUsers(users);
  return sanitizeUser(user);
}

function grantReseller(userId, discountPercent = 15) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้');

  user.isReseller = true;
  user.resellerDiscount = Number(discountPercent) || 15;
  user.resellerActivatedAt = new Date().toISOString();
  if (user.role !== 'admin') {
    user.role = 'reseller';
  }

  saveUsers(users);
  return sanitizeUser(user);
}

module.exports = {
  getUsers,
  saveUsers,
  findUserById,
  findUserByEmail,
  findUserByUsername,
  findUserByUsernameOrEmail,
  findUserByDiscordId,
  findUserByGoogleId,
  createLocalUser,
  findOrCreateDiscordUser,
  findOrCreateGoogleUser,
  verifyPassword,
  changeUserPassword,
  sanitizeUser,
  updateUserBalance,
  getTransactions,
  addTransaction,
  getOrders,
  createOrder,
  checkAndRedeemTrueCard,
  redeemTrueMoneyVoucher,
  processBankTransfer,
  redeemCoupon,
  getSettings,
  saveSettings,
  getProducts,
  saveProducts,
  createOrUpdateProduct,
  deleteProduct,
  deleteUser,
  updateUserProfile,
  getProductStock,
  addProductStockKeys,
  deleteProductStockKey,
  clearProductStock,
  resetOrders,
  resetRevenue,
  resetProducts,
  resetUsers,
  resetAllData,
  getResellerData,
  saveResellerData,
  createResellerCode,
  deleteResellerCode,
  saveResellerProductPrices,
  redeemResellerCode,
  revokeReseller,
  grantReseller
};


