require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./data/database');
const { BANK_TEMPLATES, verifyBankSlip } = require('./lib/slipVerifier');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Bank Templates API
app.get('/api/bank-templates', (req, res) => {
  res.json({ success: true, templates: BANK_TEMPLATES });
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'dekthep_store_secret_dev_session_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Serve static frontend files (disable caching so users always get the freshest CSS/JS)
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Helper: Check OAuth configuration
function getOAuthConfig() {
  const discordClientId = (process.env.DISCORD_CLIENT_ID || '').trim();
  const discordClientSecret = (process.env.DISCORD_CLIENT_SECRET || '').trim();
  const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

  return {
    discord: {
      configured: Boolean(discordClientId && discordClientSecret && !discordClientId.includes('your_')),
      clientId: discordClientId,
      clientSecret: discordClientSecret,
      redirectUri: `${BASE_URL}/auth/discord/callback`
    },
    google: {
      configured: Boolean(googleClientId && googleClientSecret && !googleClientId.includes('your_')),
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      redirectUri: `${BASE_URL}/auth/google/callback`
    }
  };
}

// ==========================================
// AUTH & USER STATUS
// ==========================================

app.get('/api/status', (req, res) => {
  const oauth = getOAuthConfig();
  let freshUser = null;
  if (req.session.user) {
    freshUser = db.findUserById(req.session.user.id);
    if (freshUser) {
      req.session.user = db.sanitizeUser(freshUser);
    }
  }

  res.json({
    authenticated: Boolean(req.session.user),
    user: req.session.user || null,
    oauth: {
      discord: { configured: oauth.discord.configured, redirectUri: oauth.discord.redirectUri },
      google: { configured: oauth.google.configured, redirectUri: oauth.google.redirectUri }
    }
  });
});

app.post('/api/register', (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    const trimmedUser = username.trim();
    if (trimmedUser.length < 3 || trimmedUser.length > 30) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้ต้องมีความยาว 3 - 30 ตัวอักษร' });
    }

    let cleanEmail = null;
    if (email && typeof email === 'string' && email.trim().length > 0) {
      cleanEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง (หากไม่มีอีเมลสามารถเว้นว่างได้)' });
      }
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' });
    }

    // Check if user already exists
    const existing = db.findUserByUsername(trimmedUser) || (cleanEmail ? db.findUserByEmail(cleanEmail) : null);
    if (existing) {
      // If password matches existing account, gracefully log them in!
      if (existing.passwordHash && db.verifyPassword(existing, password)) {
        const safeUser = db.sanitizeUser(existing);
        req.session.user = safeUser;
        return res.json({
          success: true,
          message: 'เข้าสู่ระบบด้วยบัญชีของคุณเรียบร้อยแล้ว!',
          user: safeUser
        });
      }
      const isEmailDup = Boolean(cleanEmail && db.findUserByEmail(cleanEmail));
      const errMsg = isEmailDup 
        ? 'อีเมลนี้ถูกใช้งานแล้วในระบบ กรุณาเข้าสู่ระบบด้วยอีเมลนี้ หรือใช้อีเมลอื่น'
        : 'ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ กรุณาเลือกชื่อผู้ใช้อื่น หรือเข้าสู่ระบบ';
      return res.status(400).json({ error: errMsg });
    }

    const newUser = db.createLocalUser({ username: trimmedUser, email: cleanEmail, password });
    req.session.user = newUser;

    return res.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ DEKTHEP STORE!',
      user: newUser
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.username || req.body.email || '').trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน' });
    }

    const user = db.findUserByUsernameOrEmail(identifier);
    if (!user) {
      return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้นี้ หรือข้อมูลไม่ถูกต้อง' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ 
        error: `บัญชีนี้เข้าสู่ระบบด้วย ${user.provider.toUpperCase()} กรุณากดปุ่มเข้าสู่ระบบด้วย ${user.provider}` 
      });
    }

    const isValid = db.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' });
    }

    const safeUser = db.sanitizeUser(user);
    req.session.user = safeUser;

    return res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับมา!',
      user: safeUser
    });
  } catch (err) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดของระบบ: ' + err.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'ไม่สามารถออกจากระบบได้' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'ออกจากระบบเรียบร้อยแล้ว' });
  });
});

// ==========================================
// TOP-UP APIS (ระบบเติมเงิน & เช็คบัตรจริง)
// ==========================================

// Helper: Check if store is closed for maintenance
function checkStoreMaintenance(req) {
  const settings = db.getSettings();
  const isAdmin = Boolean(
    req.session?.adminBypass ||
    (req.session?.user && (req.session.user.role === 'admin' || req.session.user.username === 'samobile'))
  );
  if (settings.maintenance?.enabled && !isAdmin) {
    return 'ร้านค้าปิดปรับปรุงชั่วคราว ไม่สามารถทำรายการได้ในขณะนี้ กรุณารอเปิดให้บริการ';
  }
  return null;
}

// 1. TrueMoney Cash Card (เช็คบัตรทรูมันนี่ 14 หลัก)
app.post('/api/topup/card', (req, res) => {
  const maintErr = checkStoreMaintenance(req);
  if (maintErr) return res.status(403).json({ error: maintErr });

  if (!req.session.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน' });
  }

  try {
    const { cardPin, amount } = req.body;
    const result = db.checkAndRedeemTrueCard({
      userId: req.session.user.id,
      cardPin,
      expectedAmount: amount
    });

    req.session.user = result.user;
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 2. TrueMoney Wallet Gift Link (ซองของขวัญทรูมันนี่วอลเล็ท)
app.post('/api/topup/voucher', async (req, res) => {
  const maintErr = checkStoreMaintenance(req);
  if (maintErr) return res.status(403).json({ error: maintErr });

  if (!req.session.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน' });
  }

  try {
    const { voucherUrl } = req.body;
    const result = await db.redeemTrueMoneyVoucher({
      userId: req.session.user.id,
      voucherUrl,
      targetPhone: '0822847225'
    });

    req.session.user = result.user;
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 3. Bank Transfer with Slip Attachment & Real QR Verification
app.post('/api/topup/bank', async (req, res) => {
  const maintErr = checkStoreMaintenance(req);
  if (maintErr) return res.status(403).json({ error: maintErr });

  if (!req.session.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน' });
  }

  try {
    const { amount, transferDate, transferTime, slipRef, recipientName, slipImage } = req.body;

    if (!slipImage || typeof slipImage !== 'string') {
      return res.status(400).json({ error: 'กรุณาแนบรูปภาพสลิปหลักฐานการโอนเงิน' });
    }

    let imageBuffer = null;
    let savedSlipUrl = null;
    let ext = 'png';

    if (slipImage.startsWith('data:image/')) {
      const matches = slipImage.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        imageBuffer = Buffer.from(matches[2], 'base64');
      }
    } else if (slipImage.startsWith('uploads/')) {
      const localPath = path.join(__dirname, 'public', slipImage);
      if (fs.existsSync(localPath)) {
        imageBuffer = fs.readFileSync(localPath);
        savedSlipUrl = slipImage;
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({ error: 'ไฟล์สลิปไม่ถูกต้อง หรือไม่สามารถเปิดอ่านรูปภาพได้' });
    }

    // 1. Verify Real Slip, QR Code, Bank Match, Recipient Name, Date & Time, Anti-Replay
    const currentSettings = db.getSettings();
    const verifyResult = await verifyBankSlip({
      imageBuffer,
      amount,
      user: req.session.user,
      settings: currentSettings,
      transferDate,
      transferTime,
      slipRef,
      recipientName
    });

    // 2. Save file to public/uploads/slips if not already saved
    if (!savedSlipUrl) {
      const slipFilename = `slip_${Date.now()}_${req.session.user.id.slice(-4)}.${ext}`;
      const slipsDir = path.join(__dirname, 'public', 'uploads', 'slips');
      if (!fs.existsSync(slipsDir)) {
        fs.mkdirSync(slipsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(slipsDir, slipFilename), imageBuffer);
      savedSlipUrl = `uploads/slips/${slipFilename}`;
    }

    // 3. Process credit top-up and record transaction
    const result = db.processBankTransfer({
      userId: req.session.user.id,
      amount: verifyResult.amount,
      transferTime: transferTime || 'ตามสลิป',
      slipRef: verifyResult.transRef,
      slipImage: savedSlipUrl,
      verified: true
    });

    req.session.user = result.user;
    return res.json({
      ...result,
      verifiedBank: verifyResult.bankName,
      message: `ตรวจสอบสลิปและ QR Code ถูกต้อง! เติมเงินเข้ากระเป๋า +฿${verifyResult.amount.toFixed(2)} บาท เรียบร้อยแล้ว`
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 4. Coupon Code (โค้ดคูปองเติมเงิน)
app.post('/api/topup/coupon', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำการแลกโค้ดคูปอง' });
  }

  try {
    const { code } = req.body;
    const result = db.redeemCoupon({
      userId: req.session.user.id,
      code
    });

    req.session.user = result.user;
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// STORE PURCHASE API (สั่งซื้อสินค้าจริง)
// ==========================================

app.post('/api/buy', (req, res) => {
  const maintErr = checkStoreMaintenance(req);
  if (maintErr) {
    return res.status(403).json({ error: maintErr });
  }

  if (!req.session.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า' });
  }

  try {
    const { productName, price, category, quantity, variantName, discountCode } = req.body;
    const { order, updatedUser } = db.createOrder({
      userId: req.session.user.id,
      productName,
      price,
      category,
      quantity,
      variantName,
      discountCode
    });

    req.session.user = updatedUser;
    return res.json({
      success: true,
      message: `สั่งซื้อสำเร็จ! ได้รับสินค้า ${order.productName}`,
      order,
      user: updatedUser
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// USER PROFILE & AVATAR / FRAME API
// ==========================================
app.post('/api/user/change-password', (req,res)=>{
  if(!req.session.user)return res.status(401).json({error:'กรุณาเข้าสู่ระบบ'});
  const {oldPassword,newPassword}=req.body||{};
  if(typeof oldPassword!=='string'||typeof newPassword!=='string')return res.status(400).json({error:'ข้อมูลไม่ถูกต้อง'});
  try{db.changeUserPassword(req.session.user.id,oldPassword,newPassword);return res.json({success:true,message:'เปลี่ยนรหัสผ่านสำเร็จ'});}
  catch(e){return res.status(400).json({error:e.message});}
});

app.post('/api/user/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนจัดการโปรไฟล์' });
  }

  try {
    const { avatar, frame } = req.body;
    const updated = db.updateUserProfile(req.session.user.id, { avatar, frame });
    req.session.user = updated;
    return res.json({
      success: true,
      message: 'อัปเดตรูปโปรไฟล์และกรอบรูปเรียบร้อยแล้ว!',
      user: updated
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// RESELLER API (ระบบตัวแทนจำหน่าย)
// ==========================================
// 1. Redeem Reseller Code in Profile
app.post('/api/reseller/redeem', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนเปิดใช้งานสิทธิ์ตัวแทนจำหน่าย' });
  }
  try {
    const { code } = req.body;
    const result = db.redeemResellerCode(req.session.user.id, code);
    req.session.user = result.user;
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 2. Get Public Reseller Pricing
app.get('/api/reseller/pricing', (req, res) => {
  const data = db.getResellerData();
  return res.json({
    success: true,
    productPrices: data.productPrices || {},
    defaultDiscountPercent: data.defaultDiscountPercent || 15
  });
});

// ==========================================
// HISTORY API (ประวัติการซื้อ & เติมเงิน)
// ==========================================

app.get('/api/history', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนดูประวัติ' });
  }

  const userId = req.session.user.id;
  const orders = db.getOrders(userId);
  const transactions = db.getTransactions(userId);

  return res.json({
    success: true,
    orders,
    transactions
  });
});

// ==========================================
// DISCORD OAUTH
// ==========================================

app.get('/auth/discord', (req, res) => {
  const oauth = getOAuthConfig();
  if (!oauth.discord.configured) {
    return res.redirect('/?oauth_error=discord_not_configured');
  }

  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauth_discord_state = state;

  const discordAuthUrl = new URL('https://discord.com/oauth2/authorize');
  discordAuthUrl.searchParams.set('client_id', oauth.discord.clientId);
  discordAuthUrl.searchParams.set('response_type', 'code');
  discordAuthUrl.searchParams.set('redirect_uri', oauth.discord.redirectUri);
  discordAuthUrl.searchParams.set('scope', 'identify email');
  discordAuthUrl.searchParams.set('state', state);

  res.redirect(discordAuthUrl.toString());
});

app.get('/auth/discord/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.redirect(`/?oauth_error=discord_cancelled&desc=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect('/?oauth_error=missing_code');
  }

  delete req.session.oauth_discord_state;
  const oauth = getOAuthConfig();

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: oauth.discord.clientId,
        client_secret: oauth.discord.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: oauth.discord.redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      return res.redirect(`/?oauth_error=discord_token_failed&desc=${encodeURIComponent(errBody)}`);
    }

    const tokenData = await tokenResponse.json();
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    if (!userResponse.ok) {
      return res.redirect('/?oauth_error=discord_user_failed');
    }

    const discordUser = await userResponse.json();
    let avatarUrl = null;
    if (discordUser.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`;
    } else {
      const defaultIndex = discordUser.discriminator === '0' 
        ? Number((BigInt(discordUser.id) >> 22n) % 6n)
        : Number(discordUser.discriminator) % 5;
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    }

    const user = db.findOrCreateDiscordUser({
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      email: discordUser.email || null,
      avatarUrl
    });

    req.session.user = user;
    return res.redirect('/?oauth_success=discord');
  } catch (err) {
    return res.redirect(`/?oauth_error=discord_server_error&desc=${encodeURIComponent(err.message)}`);
  }
});

// ==========================================
// GOOGLE OAUTH
// ==========================================

app.get('/auth/google', (req, res) => {
  const oauth = getOAuthConfig();
  if (!oauth.google.configured) {
    return res.redirect('/?oauth_error=google_not_configured');
  }

  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauth_google_state = state;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', oauth.google.clientId);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('redirect_uri', oauth.google.redirectUri);
  googleAuthUrl.searchParams.set('scope', 'openid profile email');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  res.redirect(googleAuthUrl.toString());
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/?oauth_error=google_cancelled&desc=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect('/?oauth_error=missing_code');
  }

  delete req.session.oauth_google_state;
  const oauth = getOAuthConfig();

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: oauth.google.clientId,
        client_secret: oauth.google.clientSecret,
        redirect_uri: oauth.google.redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      return res.redirect(`/?oauth_error=google_token_failed&desc=${encodeURIComponent(errBody)}`);
    }

    const tokenData = await tokenResponse.json();
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    if (!profileResponse.ok) {
      return res.redirect('/?oauth_error=google_user_failed');
    }

    const googleUser = await profileResponse.json();
    const user = db.findOrCreateGoogleUser({
      googleId: googleUser.sub,
      name: googleUser.name,
      email: googleUser.email,
      avatarUrl: googleUser.picture
    });

    req.session.user = user;
    return res.redirect('/?oauth_success=google');
  } catch (err) {
    return res.redirect(`/?oauth_error=google_server_error&desc=${encodeURIComponent(err.message)}`);
  }
});

// Demo login
app.post('/api/demo-login', (req, res) => {
  const { provider } = req.body;
  if (provider === 'discord') {
    const user = db.findOrCreateDiscordUser({
      discordId: '123456789012345678',
      username: 'dekthep_gamer',
      globalName: 'DekThep Member',
      email: 'member@dekthep.store',
      avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png'
    });
    req.session.user = user;
    return res.json({ success: true, user, message: 'เข้าสู่ระบบด้วย Discord (Demo) สำเร็จ!' });
  } else if (provider === 'google') {
    const user = db.findOrCreateGoogleUser({
      googleId: '109876543210987654321',
      name: 'DekThep Google User',
      email: 'customer@gmail.com',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
    });
    req.session.user = user;
    return res.json({ success: true, user, message: 'เข้าสู่ระบบด้วย Google (Demo) สำเร็จ!' });
  }
  return res.status(400).json({ error: 'Invalid provider' });
});

// ==========================================
// ADMIN & BACKOFFICE APIS (ระบบหลังบ้าน)
// ==========================================

function requireAdmin(req, res, next) {
  // Allow if session user is admin or username is samobile or adminBypass is true
  if (req.session.adminBypass || (req.session.user && (req.session.user.role === 'admin' || req.session.user.username === 'samobile'))) {
    return next();
  }
  // Allow if admin PIN is supplied in header or body
  const settings = db.getSettings();
  const validPin = settings.maintenance?.pinCode || '123456';
  const suppliedPin = req.headers['x-admin-pin'] || req.body?.adminPin;
  if (suppliedPin && String(suppliedPin).trim() === String(validPin).trim()) {
    return next();
  }
  // Allow if admin key is supplied in header or body
  const adminSecret = req.headers['x-admin-key'] || req.body?.adminKey;
  if (adminSecret === 'dekthep_admin_2026' || adminSecret === 'admin1234') {
    return next();
  }
  return res.status(403).json({ error: 'ปฏิเสธการเข้าถึง: สำหรับผู้ดูแลระบบ (Admin) เท่านั้น' });
}

// 1. Get Public Settings
app.get('/api/settings', (req, res) => {
  const settings = db.getSettings();

  // Ensure default maintenance structure
  if (!settings.maintenance) {
    settings.maintenance = {};
  }
  if (!settings.maintenance.pinCode) {
    settings.maintenance.pinCode = '123456';
  }

  // Auto open store if maintenance mode is enabled and openingDateTime has arrived
  if (settings.maintenance?.enabled && settings.maintenance?.autoOpen && settings.maintenance?.openingDateTime) {
    const openTime = new Date(settings.maintenance.openingDateTime).getTime();
    if (!isNaN(openTime) && Date.now() >= openTime) {
      settings.maintenance.enabled = false;
      db.saveSettings(settings);
    }
  }

  // Check if current user is admin
  const isAdmin = Boolean(
    req.session.adminBypass ||
    (req.session.user && (req.session.user.role === 'admin' || req.session.user.username === 'samobile'))
  );

  // Deep clone to safely filter sensitive fields
  const safeSettings = JSON.parse(JSON.stringify(settings));
  if (!isAdmin && safeSettings.maintenance) {
    // Hide actual PIN from public visitors, only show that PIN feature is enabled
    safeSettings.maintenance.hasPin = Boolean(safeSettings.maintenance.pinCode);
    delete safeSettings.maintenance.pinCode;
  }

  res.json({ success: true, settings: safeSettings, isAdmin });
});

// 1.1 Verify 6-Digit Admin PIN
app.post('/api/admin/verify-pin', (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: 'กรุณากรอกรหัส PIN 6 หลัก' });
    }

    const settings = db.getSettings();
    const targetPin = settings.maintenance?.pinCode || '123456';

    if (String(pin).trim() === String(targetPin).trim()) {
      req.session.adminBypass = true;
      if (!req.session.user) {
        req.session.user = {
          id: 'admin_pin_' + Date.now(),
          username: 'Administrator',
          role: 'admin',
          balance: 999999,
          isReseller: true,
          resellerDiscount: 30
        };
      } else {
        req.session.user.role = 'admin';
      }

      return res.json({
        success: true,
        message: 'รหัส PIN 6 ตัวถูกต้อง! ปลดล็อกเข้าสู่ระบบหลังบ้านเรียบร้อยแล้ว',
        user: req.session.user
      });
    } else {
      return res.status(401).json({ error: 'รหัส PIN 6 ตัวไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบรหัส PIN: ' + err.message });
  }
});

// 1.2 Quick Toggle / Update Store Maintenance
app.post('/api/admin/maintenance/toggle', requireAdmin, (req, res) => {
  try {
    const { enabled, title, subtitle, openingDateTime, autoOpen, pinCode, discordUrl } = req.body;
    const settings = db.getSettings();
    const currentMaint = settings.maintenance || {};

    const newEnabled = enabled !== undefined ? Boolean(enabled) : !currentMaint.enabled;
    const newMaint = {
      ...currentMaint,
      enabled: newEnabled,
      title: title !== undefined ? title : (currentMaint.title || 'ร้านปิดปรับปรุงชั่วคราว'),
      subtitle: subtitle !== undefined ? subtitle : (currentMaint.subtitle || 'ระบบกำลังทำการปรับปรุงและเตรียมเปิดให้บริการอย่างเป็นทางการเร็วๆ นี้'),
      openingDateTime: openingDateTime !== undefined ? openingDateTime : (currentMaint.openingDateTime || new Date(Date.now() + 24*3600*1000).toISOString()),
      autoOpen: autoOpen !== undefined ? Boolean(autoOpen) : (currentMaint.autoOpen !== false),
      pinCode: pinCode !== undefined && String(pinCode).trim().length === 6 ? String(pinCode).trim() : (currentMaint.pinCode || '123456'),
      discordUrl: discordUrl !== undefined ? discordUrl : (currentMaint.discordUrl || 'https://discord.gg/2gnZUFFSXU'),
      allowAdminBypass: true
    };

    settings.maintenance = newMaint;
    const saved = db.saveSettings(settings);

    return res.json({
      success: true,
      message: newEnabled ? 'ปิดร้าน (เข้าสู่โหมดปิดปรับปรุง) เรียบร้อยแล้ว' : 'เปิดร้านให้บริการตามปกติเรียบร้อยแล้ว!',
      maintenance: saved.maintenance
    });
  } catch (err) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาด: ' + err.message });
  }
});

// 2. Save Settings (Colors, Images, Texts, Categories, etc.)
app.post('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const updated = db.saveSettings(req.body);
    res.json({ success: true, message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!', settings: updated });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: ' + err.message });
  }
});

// Fetch YouTube Metadata (Title, Artist / Channel, Thumbnail)
app.post('/api/admin/fetch-youtube-meta', requireAdmin, async (req, res) => {
  try {
    const { url, videoId, urlOrId } = req.body;
    let raw = (urlOrId || url || videoId || '').trim();
    let vid = '';
    if (/^[\w-]{11}$/.test(raw)) {
      vid = raw;
    } else if (raw) {
      const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
      if (match) vid = match[1];
    }

    if (!vid) {
      return res.status(400).json({ error: 'ไม่พบ YouTube Video ID ในลิงก์' });
    }

    const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${vid}`;
    let meta = { title: '', artist: '', author_name: '', thumbnail_url: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`, videoId: vid };
    try {
      const fetchRes = await fetch(oembedUrl);
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        meta.title = data.title || '';
        meta.author_name = data.author_name || '';
        meta.artist = data.author_name || '';
        if (data.thumbnail_url) meta.thumbnail_url = data.thumbnail_url;
      }
    } catch (e) {
      // Fallback
    }
    res.json({ success: true, meta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Reset Settings to Default
app.post('/api/admin/reset-settings', requireAdmin, (req, res) => {
  try {
    const defaultSettings = {
      general: {
        siteTitle: "DEKTHEP STORE - ยินดีต้อนรับสู่ร้านค้าที่ดีที่สุด",
        storeName: "DEKTHEP STORE",
        storeTagline: "ร้านขายของบน Discord จำหน่ายสินค้าดิจิทัลและระบบออโต้ ปลอดภัยและรวดเร็ว 24 ชั่วโมง",
        discordUrl: "https://discord.gg/2gnZUFFSXU",
        discordServerName: "DEKTHEP STORE OFFICIAL",
        youtubeUrl: "https://discord.gg/2gnZUFFSXU",
        contactEmail: "support@dekthep.store",
        announcementText: "ยินดีต้อนรับสู่ DEKTHEP STORE! โปรแกรมช่วยเล่นคุณภาพสูง ปลอดภัย 100% พร้อมบริการ 24 ชม."
      },
      hero: {
        badgeText: "EXTERNAL CHEAT NO.1",
        titlePrefix: "ยินดีต้อนรับสู่ร้าน",
        titleGradient: "DEKTHEP STORE",
        subtitleHighlight: "we will give the greatest experience external cheat",
        subtitle: "แหล่งรวมโปรแกรมช่วยเล่น ไอดีเกม และบริการระบบออโต้ที่ดีที่สุด ปลอดภัย 100%",
        btnPrimaryText: "ดูสินค้าทั้งหมด",
        btnSecondaryText: "ติดต่อเรา Discord",
        statsUsers: "3,552",
        statsProducts: "41",
        statsStock: "587",
        statsSold: "24,603"
      },
      theme: {
        preset: "cyber_blue",
        brandPrimary: "#070ee4",
        brandHover: "#1e26ff",
        brandAccent: "#3b82f6",
        brandGlow: "rgba(7, 14, 228, 0.45)",
        bgBody: "#05070f",
        bgCard: "#0b0e1a",
        bgCardHover: "#11162a",
        borderCard: "rgba(255, 255, 255, 0.08)",
        borderCardHover: "rgba(7, 14, 228, 0.7)",
        textPrimary: "#ffffff",
        textSecondary: "rgba(255, 255, 255, 0.65)",
        btnPrimaryBg: "#070ee4",
        btnPrimaryText: "#ffffff"
      },
      images: {
        logo: "assets/real_logo.webp",
        favicon: "assets/real_logo.webp",
        heroBanner: "assets/banner.jpg",
        storeBanner: "assets/banner.jpg",
        cat_pc: "assets/cat_pc.webp",
        cat_ios: "assets/cat_ios.webp",
        cat_xreg: "assets/cat_xreg.webp",
        cat_ad: "assets/cat_ad.webp"
      },
      payments: {
        bank: {
          enabled: true,
          bankCode: "GSB",
          bankName: "ธนาคารออมสิน (GSB)",
          accountNo: "020463192979",
          accountName: "ด.ช. ไออ้อน ขันธพาลี",
          promptpayNo: "020463192979",
          qrImage: "",
          note: "โอนเงินแล้วกรอกเวลาและเลขอ้างอิงสลิป ระบบตรวจสอบและปรับยอดเงินอัตโนมัติ"
        },
        truemoney: {
          enabled: true,
          phone: "0822847225",
          feePercent: 2.9,
          minAmount: 10,
          note: "ซองของขวัญ TrueMoney Wallet กรอกลิงก์ซองเพื่อเติมเงินทันที"
        },
        truecard: {
          enabled: true,
          note: "บัตรเงินสด TrueMoney 14 หลัก เติมง่าย รวดเร็ว 24 ชม."
        },
        coupon: {
          enabled: true,
          note: "โค้ดคูปองกิจกรรมหรือโค้ดเติมเงินจากแอดมิน"
        }
      }
    };
    const saved = db.saveSettings(defaultSettings);
    res.json({ success: true, message: 'รีเซ็ตค่าเริ่มต้นสำเร็จ!', settings: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Upload Image (Base64 -> File on server)
app.post('/api/admin/upload', requireAdmin, (req, res) => {
  try {
    const image = req.body.image || req.body.fileData;
    const name = req.body.name || req.body.fileName || req.body.type || 'upload';
    if (!image) return res.status(400).json({ error: 'ไม่พบไฟล์รูปภาพ' });

    // If it's already an existing URL or asset path
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('assets/')) {
      return res.json({ success: true, url: image });
    }

    // Match base64 data
    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'รูปแบบรูปภาพไม่ถูกต้อง (รองรับ Base64 หรือ URL)' });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = (name || 'upload').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_${Date.now()}.${ext}`;
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uploadPath = path.join(uploadDir, filename);

    fs.writeFileSync(uploadPath, buffer);
    const fileUrl = `uploads/${filename}`;

    return res.json({ success: true, url: fileUrl, filename });
  } catch (err) {
    return res.status(500).json({ error: 'อัปโหลดภาพล้มเหลว: ' + err.message });
  }
});

// 5. Products Backoffice & Public Store API
app.get(['/api/products', '/api/admin/products'], (req, res) => {
  const products = db.getProducts();
  res.json({ success: true, count: products.length, products });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const saved = db.createOrUpdateProduct(req.body);
    const allProducts = db.getProducts();
    res.json({ success: true, message: 'บันทึกข้อมูลสินค้าเรียบร้อยแล้ว!', product: saved, products: allProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const result = db.deleteProduct(req.params.id);
    const allProducts = db.getProducts();
    res.json({ success: true, message: 'ลบรายการสินค้าเรียบร้อยแล้ว!', ...result, products: allProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stock & Key Management APIs
app.get('/api/admin/products/:id/stock', requireAdmin, (req, res) => {
  try {
    const data = db.getProductStock(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/admin/products/:id/stock/add', requireAdmin, (req, res) => {
  try {
    const { variantName, keys } = req.body;
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: 'กรุณากรอกคีย์หรือข้อมูลสินค้าอย่างน้อย 1 รายการ' });
    }
    const result = db.addProductStockKeys(req.params.id, variantName, keys);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products/:id/stock/delete', requireAdmin, (req, res) => {
  try {
    const { variantName, keyIndex } = req.body;
    const result = db.deleteProductStockKey(req.params.id, variantName, Number(keyIndex));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products/:id/stock/clear', requireAdmin, (req, res) => {
  try {
    const { variantName } = req.body;
    const result = db.clearProductStock(req.params.id, variantName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 6. Users Backoffice API
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.getUsers().map(u => db.sanitizeUser(u));
  res.json({ success: true, users });
});

app.post('/api/admin/users/balance', requireAdmin, (req, res) => {
  try {
    const { userId, balance, adjustment, note } = req.body;
    const users = db.getUsers();
    const user = users.find(u => u.id === userId || u.username === userId);
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' });

    let actionDesc = '';
    const oldBalance = Number(user.balance) || 0;

    if (req.body.clearBalance === true || balance === 0 || balance === '0') {
      user.balance = 0;
      actionDesc = `ลบยอดเงินของ ${user.username} เป็น ฿0.00 เรียบร้อยแล้ว!`;
    } else if (balance !== undefined && !isNaN(Number(balance))) {
      user.balance = Math.max(0, Number(balance));
      actionDesc = `ปรับยอดเงินของ ${user.username} เป็น ฿${user.balance.toFixed(2)} เรียบร้อยแล้ว!`;
    } else if (adjustment !== undefined && !isNaN(Number(adjustment))) {
      user.balance = Math.max(0, oldBalance + Number(adjustment));
      actionDesc = `ปรับยอดเงินของ ${user.username} เป็น ฿${user.balance.toFixed(2)} เรียบร้อยแล้ว!`;
    }

    db.saveUsers(users);

    db.addTransaction({
      userId: user.id,
      type: 'admin_adjust',
      amount: user.balance - oldBalance,
      details: note || (user.balance === 0 ? 'ผู้ดูแลระบบลบยอดเงินเป็น ฿0.00' : 'ผู้ดูแลระบบปรับปรุงยอดเงิน'),
      status: 'success'
    });

    res.json({ success: true, message: actionDesc, user: db.sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete User Account API
app.post('/api/admin/users/delete', requireAdmin, (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'กรุณาระบุรหัสสมาชิกที่ต้องการลบ' });

    if (req.session.user && req.session.user.id === userId) {
      return res.status(400).json({ error: 'ไม่สามารถลบบัญชีของตนเองที่กำลังเข้าสู่ระบบอยู่ได้' });
    }

    const result = db.deleteUser(userId);
    res.json({
      success: true,
      message: `ลบบัญชีผู้ใช้ "${result.user.username}" ออกจากระบบเรียบร้อยแล้ว`,
      user: result.user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    if (req.session.user && req.session.user.id === userId) {
      return res.status(400).json({ error: 'ไม่สามารถลบบัญชีของตนเองที่กำลังเข้าสู่ระบบอยู่ได้' });
    }

    const result = db.deleteUser(userId);
    res.json({
      success: true,
      message: `ลบบัญชีผู้ใช้ "${result.user.username}" ออกจากระบบเรียบร้อยแล้ว`,
      user: result.user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/users/role', requireAdmin, (req, res) => {
  try {
    const { userId, role } = req.body;
    const users = db.getUsers();
    const user = users.find(u => u.id === userId || u.username === userId);
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' });

    user.role = (role === 'admin') ? 'admin' : 'member';
    db.saveUsers(users);
    res.json({ success: true, message: `ตั้งค่าสิทธิ์ของ ${user.username} เป็น ${user.role} สำเร็จ!`, user: db.sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Orders & Transactions Log
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = db.getOrders();
  res.json({ success: true, orders });
});

app.get('/api/admin/transactions', requireAdmin, (req, res) => {
  const transactions = db.getTransactions();
  res.json({ success: true, transactions });
});

// 8. Live Admin Overview Statistics
app.get('/api/admin/overview-stats', requireAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    const products = db.getProducts();
    const users = db.getUsers();
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.price) || Number(o.totalPrice) || 0), 0);

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue,
        totalRevenueFormatted: '฿' + totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalProducts: products.length,
        totalProductsFormatted: products.length + ' ชิ้น',
        totalUsers: users.length,
        totalUsersFormatted: users.length + ' คน',
        status: 'online',
        statusText: '🟢 ออนไลน์ 24 ชม.'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Admin Data Reset APIs (รีเซ็ตข้อมูลระบบ)
app.post('/api/admin/reset/orders', requireAdmin, (req, res) => {
  try {
    const result = db.resetOrders();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reset/revenue', requireAdmin, (req, res) => {
  try {
    const result = db.resetRevenue();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reset/products', requireAdmin, (req, res) => {
  try {
    const result = db.resetProducts();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reset/users', requireAdmin, (req, res) => {
  try {
    const result = db.resetUsers();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reset/all', requireAdmin, (req, res) => {
  try {
    const result = db.resetAllData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. Admin Reseller Management APIs (ระบบตัวแทนจำหน่ายหลังบ้าน)
// ==========================================
app.get('/api/admin/resellers', requireAdmin, (req, res) => {
  try {
    const resellerData = db.getResellerData();
    const users = db.getUsers().map(u => db.sanitizeUser(u));
    const resellerMembers = users.filter(u => u.isReseller || u.role === 'reseller');
    const products = db.getProducts();

    res.json({
      success: true,
      codes: resellerData.codes || [],
      defaultDiscountPercent: resellerData.defaultDiscountPercent || 15,
      productPrices: resellerData.productPrices || {},
      resellerMembers,
      products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/resellers/code', requireAdmin, (req, res) => {
  try {
    const { code, discountPercent, maxUses, note } = req.body;
    const newCode = db.createResellerCode({ code, discountPercent, maxUses, note });
    res.json({ success: true, message: `สร้างโค้ดตัวแทนจำหน่าย "${newCode.code}" สำเร็จ!`, code: newCode });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/resellers/code/:code', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteResellerCode(req.params.code);
    res.json({ success: true, message: `ลบโค้ดตัวแทน "${deleted.code}" เรียบร้อยแล้ว`, deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/resellers/pricing', requireAdmin, (req, res) => {
  try {
    const { productPrices, defaultDiscountPercent } = req.body;
    const updated = db.saveResellerProductPrices(productPrices, defaultDiscountPercent);
    res.json({ success: true, message: 'บันทึกราคาสินค้าสำหรับตัวแทนจำหน่ายเรียบร้อยแล้ว!', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/resellers/revoke', requireAdmin, (req, res) => {
  try {
    const { userId } = req.body;
    const updatedUser = db.revokeReseller(userId);
    res.json({ success: true, message: `เพิกถอนสิทธิ์ตัวแทนจำหน่ายของ "${updatedUser.username}" เรียบร้อยแล้ว`, user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/resellers/grant', requireAdmin, (req, res) => {
  try {
    const { userId, discountPercent } = req.body;
    const updatedUser = db.grantReseller(userId, discountPercent);
    res.json({ success: true, message: `มอบสิทธิ์ตัวแทนจำหน่ายให้ "${updatedUser.username}" (ส่วนลด ${updatedUser.resellerDiscount}%) สำเร็จ!`, user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// SPA Page Fallback Routes
app.get(['/topup', '/store', '/history', '/contact', '/admin'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 DEKTHEP STORE Server is running on: ${BASE_URL}`);
  console.log(`🌐 Open in your browser: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
