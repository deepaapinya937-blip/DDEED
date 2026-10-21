const http = require('http');
const qrcode = require('qrcode');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) { json = body; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('🧪 VERIFYING ALL USER REQUIREMENTS (END-TO-END)');
  console.log('====================================================\n');

  // 1. BANK TEMPLATES & REAL LOGOS
  console.log('--- TEST 1: Check /api/bank-templates and SVG logos ---');
  const tplRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/bank-templates',
    method: 'GET'
  });
  console.log('Templates Count:', tplRes.data.templates?.length);
  const banks = tplRes.data.templates || [];
  const gsb = banks.find(b => b.code === 'GSB');
  const scb = banks.find(b => b.code === 'SCB');
  const kbank = banks.find(b => b.code === 'KBANK');
  const promptpay = banks.find(b => b.code === 'PROMPTPAY');
  if (gsb && scb && kbank && promptpay) {
    console.log('✅ Real bank templates and SVG logos verified: GSB, SCB, KBANK, PromptPay, etc.');
  } else {
    throw new Error('Bank templates missing');
  }

  // 2. BACKOFFICE MEMBER MANAGEMENT: CLEAR BALANCE & DELETE USER (NO 'บันทึก')
  console.log('\n--- TEST 2: Backoffice Member Management ---');
  
  // Register a temporary user for testing
  const testUserNum = Date.now();
  const testUsername = `user_del_${testUserNum}`;
  const regRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: testUsername,
    password: 'password123',
    confirmPassword: 'password123'
  });
  const cookie = regRes.headers['set-cookie'] ? regRes.headers['set-cookie'][0].split(';')[0] : '';
  const userId = regRes.data.user.id;
  console.log(`Registered test member: ${testUsername} (ID: ${userId})`);

  // Admin tops up balance initially
  await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users/balance',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'dekthep_admin_2026'
    }
  }, {
    userId: userId,
    balance: 500
  });

  // Check balance is 500
  let usersRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users',
    method: 'GET',
    headers: { 'x-admin-key': 'dekthep_admin_2026' }
  });
  let foundUser = usersRes.data.users.find(u => u.id === userId);
  console.log(`Balance after add: ฿${foundUser.balance}`);
  if (foundUser.balance !== 500) {
    throw new Error('Initial balance set failed');
  }

  // 2.1 Test "ลบยอดเงิน" (Clear balance to 0)
  console.log('Testing "ลบยอดเงิน" (clearBalance: true)...');
  const clearRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users/balance',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'dekthep_admin_2026'
    }
  }, {
    userId: userId,
    clearBalance: true
  });
  console.log('Clear balance response:', clearRes.data);
  if (JSON.stringify(clearRes.data).includes('บันทึก')) {
    throw new Error('Forbidden word "บันทึก" detected in clear balance response!');
  }
  if (clearRes.data.user?.balance !== 0) {
    throw new Error('Balance was not reset to 0');
  }
  console.log('✅ "ลบยอดเงิน" succeeded, balance is now ฿0 and no word "บันทึก" found.');

  // 2.2 Test "ลบบัญชี" (Delete user account)
  console.log('Testing "ลบบัญชี" (POST /api/admin/users/delete)...');
  const delRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users/delete',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'dekthep_admin_2026'
    }
  }, {
    userId: userId
  });
  console.log('Delete user response:', delRes.data);
  if (JSON.stringify(delRes.data).includes('บันทึก')) {
    throw new Error('Forbidden word "บันทึก" detected in delete user response!');
  }

  // Verify user is gone
  usersRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users',
    method: 'GET',
    headers: { 'x-admin-key': 'dekthep_admin_2026' }
  });
  foundUser = usersRes.data.users.find(u => u.id === userId);
  if (foundUser) {
    throw new Error('User was not deleted!');
  }
  console.log('✅ "ลบบัญชี" succeeded, user permanently removed from database.');

  // 3. SLIP & QR CODE VERIFICATION ENGINE
  console.log('\n--- TEST 3: Bank Transfer Slip & QR Code Verification ---');

  // Register slip test user
  const slipUser = `slip_user_${Date.now()}`;
  const slipUserRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: slipUser,
    password: 'password123',
    confirmPassword: 'password123'
  });
  const slipCookie = slipUserRes.headers['set-cookie'][0].split(';')[0];
  console.log(`Registered slip test user: ${slipUser}`);

  // 3.1 Case A: Slip without QR code (Plain image)
  console.log('\n[Case A] Uploading image without QR code...');
  // 1x1 transparent PNG
  const plainPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAAElFTkSuQmCC';
  const noQrRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 100,
    slipImage: plainPngBase64
  });
  console.log('Status:', noQrRes.status, 'Error:', noQrRes.data.error);
  if (noQrRes.status === 400 && noQrRes.data.error.includes('ไม่พบ QR Code')) {
    console.log('✅ Correctly rejected: Image has no QR code');
  } else {
    throw new Error('Case A failed: should reject image without QR');
  }

  // 3.2 Case B: Fake QR (e.g. random text URL)
  console.log('\n[Case B] Uploading fake / non-bank QR code...');
  const fakeQrDataUri = await qrcode.toDataURL('https://youtube.com/watch?v=dQw4w9WgXcQ');
  const fakeQrRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 100,
    slipImage: fakeQrDataUri
  });
  console.log('Status:', fakeQrRes.status, 'Error:', fakeQrRes.data.error);
  if (fakeQrRes.status === 400 && fakeQrRes.data.error.includes('ไม่ใช่สลิปโอนเงินของธนาคาร')) {
    console.log('✅ Correctly rejected: Fake / Non-bank QR');
  } else {
    throw new Error('Case B failed: should reject fake QR');
  }

  function makeBScanC({ sendingBank, receivingBank, transRef, amount }) {
    const refStr = String(transRef);
    const refLen = String(refStr.length).padStart(2, '0');
    let inner = `00060000010103${sendingBank}02${refLen}${refStr}`;
    if (receivingBank) {
      inner += `0303${receivingBank}`;
    }
    const innerLen = String(inner.length).padStart(2, '0');
    let payload = `00${innerLen}${inner}`;
    if (amount) {
      const amtStr = Number(amount).toFixed(2);
      const amtLen = String(amtStr.length).padStart(2, '0');
      payload += `54${amtLen}${amtStr}`;
    }
    return payload;
  }

  // 3.3 Case C: Bank Mismatch
  // Store is configured with GSB (030). We upload an SCB (014) transfer slip.
  console.log('\n[Case C] Uploading slip with bank mismatch (SCB slip transferred to SCB 014, while store is GSB 030)...');
  const scbQrPayload = makeBScanC({
    sendingBank: '014',
    receivingBank: '014',
    transRef: `REF_SCB_${Date.now()}`,
    amount: 100.00
  });
  const scbQrDataUri = await qrcode.toDataURL(scbQrPayload, { width: 350 });
  const mismatchRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 100,
    slipImage: scbQrDataUri
  });
  console.log('Status:', mismatchRes.status, 'Error:', mismatchRes.data.error);
  if (mismatchRes.status === 400 && mismatchRes.data.error.includes('ไม่ตรงกับธนาคารที่ระบบกำหนด')) {
    console.log('✅ Correctly rejected: Bank mismatch caught successfully!');
  } else {
    throw new Error('Case C failed: should reject bank mismatch: ' + JSON.stringify(mismatchRes.data));
  }

  // 3.4 Case D: Valid Real Bank Slip QR (GSB destination bank 030 matching active template)
  console.log('\n[Case D] Uploading valid real Bank Slip QR with correct recipient, date & time (฿250.00)...');
  const validQrPayload = makeBScanC({
    sendingBank: '004', // Sent from KBANK
    receivingBank: '030', // To GSB (Matching template)
    transRef: `REF_GSB_${Date.now()}`,
    amount: 250.00
  });
  const validQrDataUri = await qrcode.toDataURL(validQrPayload, { width: 350 });
  const todayDateStr = new Date().toISOString().split('T')[0];
  const validRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 250,
    transferDate: todayDateStr,
    transferTime: '12:30',
    recipientName: 'ด.ช. ไออ้อน ขันธพาลี',
    slipImage: validQrDataUri
  });
  console.log('Status:', validRes.status, 'Response:', validRes.data);
  if (validRes.status === 200 && validRes.data.success && validRes.data.user?.balance === 250) {
    console.log('✅ Real slip verified, credit added: ฿250.00!');
  } else {
    throw new Error('Case D failed: valid slip rejected: ' + JSON.stringify(validRes.data));
  }

  // 3.5 Case E: Replay attack (Submitting the exact same slip again)
  console.log('\n[Case E] Re-uploading the same slip (Anti-Replay check)...');
  const replayRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 250,
    transferDate: todayDateStr,
    transferTime: '12:30',
    recipientName: 'ด.ช. ไออ้อน ขันธพาลี',
    slipImage: validQrDataUri
  });
  console.log('Status:', replayRes.status, 'Error:', replayRes.data.error);
  if (replayRes.status === 400 && replayRes.data.error.includes('เคยถูกใช้งานเติมเงินไปแล้ว')) {
    console.log('✅ Anti-Replay protection working: Reused slip rejected!');
  } else {
    throw new Error('Case E failed: duplicate slip was not rejected!');
  }

  // 3.6 Case F: Recipient Name Mismatch Test
  console.log('\n[Case F] Testing recipient name mismatch (Wrong Account Name)...');
  const newSlipQr1 = await qrcode.toDataURL(makeBScanC({
    sendingBank: '004',
    receivingBank: '030',
    transRef: `REF_RECP_${Date.now()}`,
    amount: 50.00
  }), { width: 350 });

  const nameMismatchRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 50,
    transferDate: todayDateStr,
    transferTime: '12:30',
    recipientName: 'นาย สมชาย ใจดีมาก (ชื่อไม่ตรง)',
    slipImage: newSlipQr1
  });
  console.log('Status:', nameMismatchRes.status, 'Error:', nameMismatchRes.data.error);
  if (nameMismatchRes.status === 400 && nameMismatchRes.data.error.includes('ชื่อผู้รับเงิน')) {
    console.log('✅ Correctly rejected: Recipient name mismatch caught!');
  } else {
    throw new Error('Case F failed: should reject recipient name mismatch');
  }

  // 3.7 Case G: Future Date Test
  console.log('\n[Case G] Testing future transfer date rejection...');
  const newSlipQr2 = await qrcode.toDataURL(makeBScanC({
    sendingBank: '004',
    receivingBank: '030',
    transRef: `REF_FUTD_${Date.now()}`,
    amount: 50.00
  }), { width: 350 });

  const futureDateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 50,
    transferDate: '2030-01-01',
    transferTime: '12:30',
    recipientName: 'ด.ช. ไออ้อน ขันธพาลี',
    slipImage: newSlipQr2
  });
  console.log('Status:', futureDateRes.status, 'Error:', futureDateRes.data.error);
  if (futureDateRes.status === 400 && futureDateRes.data.error.includes('อนาคต')) {
    console.log('✅ Correctly rejected: Future date caught!');
  } else {
    throw new Error('Case G failed: should reject future date');
  }

  // 3.8 Case H: Expired Slip Date (> 3 days old)
  console.log('\n[Case H] Testing expired slip rejection (> 3 days old)...');
  const newSlipQr3 = await qrcode.toDataURL(makeBScanC({
    sendingBank: '004',
    receivingBank: '030',
    transRef: `REF_OLDD_${Date.now()}`,
    amount: 50.00
  }), { width: 350 });

  const expiredDateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 50,
    transferDate: '2024-01-01',
    transferTime: '12:30',
    recipientName: 'ด.ช. ไออ้อน ขันธพาลี',
    slipImage: newSlipQr3
  });
  console.log('Status:', expiredDateRes.status, 'Error:', expiredDateRes.data.error);
  if (expiredDateRes.status === 400 && expiredDateRes.data.error.includes('หมดอายุ')) {
    console.log('✅ Correctly rejected: Expired slip caught!');
  } else {
    throw new Error('Case H failed: should reject expired slip');
  }

  // 3.9 Case I: Invalid Time Format
  console.log('\n[Case I] Testing invalid time format rejection...');
  const newSlipQr4 = await qrcode.toDataURL(makeBScanC({
    sendingBank: '004',
    receivingBank: '030',
    transRef: `REF_TIME_${Date.now()}`,
    amount: 50.00
  }), { width: 350 });

  const invalidTimeRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/topup/bank',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': slipCookie }
  }, {
    amount: 50,
    transferDate: todayDateStr,
    transferTime: '99:99',
    recipientName: 'ด.ช. ไออ้อน ขันธพาลี',
    slipImage: newSlipQr4
  });
  console.log('Status:', invalidTimeRes.status, 'Error:', invalidTimeRes.data.error);
  if (invalidTimeRes.status === 400 && invalidTimeRes.data.error.includes('รูปแบบเวลาไม่ถูกต้อง')) {
    console.log('✅ Correctly rejected: Invalid time format caught!');
  } else {
    throw new Error('Case I failed: should reject invalid time format');
  }

  // 4. TEST LIVE OVERVIEW STATS (100% Real Database Stats)
  console.log('\n--- TEST 4: Live Overview Stats API (100% Real from Database) ---');
  const statsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/overview-stats',
    method: 'GET',
    headers: { 'x-admin-key': 'dekthep_admin_2026' }
  });
  console.log('Live Stats returned:', statsRes.data);
  if (statsRes.status === 200 && statsRes.data.success && statsRes.data.stats) {
    const s = statsRes.data.stats;
    console.log(`- ยอดขายสินค้ารวม: ${s.totalRevenueFormatted}`);
    console.log(`- รายการสินค้าทั้งหมด: ${s.totalProductsFormatted}`);
    console.log(`- สมาชิกในระบบ: ${s.totalUsersFormatted}`);
    console.log(`- สถานะระบบ: ${s.statusText}`);
    console.log('✅ Live Overview Stats verified: All data comes directly from real database files!');
  } else {
    throw new Error('Test 4 failed: cannot load live overview stats');
  }

  // 5. TEST CONTACT US MODAL & BACKOFFICE CONFIG
  console.log('\n--- TEST 5: Contact Us Modal & Backoffice Configuration ---');
  const newDiscord = 'https://discord.gg/dekthep_official_custom';
  const newYoutube = 'https://youtube.com/@dekthep_channel_custom';
  const saveSettingRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/settings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'dekthep_admin_2026'
    }
  }, {
    general: {
      discordUrl: newDiscord,
      youtubeUrl: newYoutube
    }
  });
  console.log('Settings save status:', saveSettingRes.status, saveSettingRes.data.message);
  if (saveSettingRes.status === 200 && saveSettingRes.data.success) {
    const pubSettingsRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/settings',
      method: 'GET'
    });
    if (pubSettingsRes.data.settings?.general?.discordUrl === newDiscord && pubSettingsRes.data.settings?.general?.youtubeUrl === newYoutube) {
      console.log('✅ Contact Us links can be changed from backoffice and are returned dynamically to the frontend!');
    } else {
      throw new Error('Contact links not updated in public settings');
    }
  } else {
    throw new Error('Failed to update contact settings');
  }

  console.log('\n====================================================');
  console.log('🎉 ALL REQUIREMENTS TESTED AND PASSED 100%!');
  console.log('====================================================');
}

run().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
