const http = require('http');

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, options, (res) => {
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
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- 🧪 STARTING PAYMENTS SYSTEM VERIFICATION ---');

  // 1. Check GET /api/settings
  console.log('\n[TEST 1] Fetching site settings...');
  const res1 = await request('/api/settings');
  if (res1.status === 200 && res1.data.settings?.payments) {
    console.log('✅ Settings API returns payments configuration:');
    console.log('   Bank:', res1.data.settings.payments.bank.bankName, '| Acc:', res1.data.settings.payments.bank.accountNo);
    console.log('   TrueMoney Phone:', res1.data.settings.payments.truemoney.phone, '| Fee:', res1.data.settings.payments.truemoney.feePercent + '%');
  } else {
    throw new Error('FAILED: payments settings missing');
  }

  // 2. Login as Demo User to get session cookie
  console.log('\n[TEST 2] Logging in as demo user...');
  const loginRes = await request('/api/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'discord' })
  });
  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
  console.log('✅ Demo login OK, cookie:', cookie);

  // 3. Admin modifies payment settings (Change Bank & Disable TrueMoney, TrueCard, Coupon)
  console.log('\n[TEST 3] Updating payments via Admin API...');
  const newPayments = {
    bank: {
      enabled: true,
      bankCode: 'KBANK',
      bankName: 'ธนาคารกสิกรไทย (KBANK)',
      accountNo: '098-7-65432-1',
      accountName: 'นายสมชาย ทดสอบระบบ',
      promptpayNo: '0891234567',
      qrImage: '',
      note: 'โอนเข้ากสิกรไทยแล้วแนบสลิป'
    },
    truemoney: {
      enabled: false,
      phone: '0812345678',
      feePercent: 3.5,
      minAmount: 20,
      note: 'ปิดปรับปรุงระบบชั่วคราว'
    },
    truecard: {
      enabled: false,
      note: 'ปิดปรับปรุงบัตรเงินสด'
    },
    coupon: {
      enabled: false,
      note: 'ปิดปรับปรุงคูปอง'
    }
  };

  const adminUpdateRes = await request('/api/admin/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'dekthep_admin_2026'
    },
    body: JSON.stringify({ payments: newPayments })
  });

  if (adminUpdateRes.status === 200 && adminUpdateRes.data.success) {
    console.log('✅ Admin settings updated successfully');
  } else {
    throw new Error('Admin update failed: ' + JSON.stringify(adminUpdateRes.data));
  }

  // Verify GET /api/settings has the updated bank & disabled channels
  const verifyRes = await request('/api/settings');
  const savedPayments = verifyRes.data.settings.payments;
  if (savedPayments.bank.accountNo === '098-7-65432-1' &&
      savedPayments.bank.bankName === 'ธนาคารกสิกรไทย (KBANK)' &&
      savedPayments.truemoney.enabled === false &&
      savedPayments.truecard.enabled === false &&
      savedPayments.coupon.enabled === false) {
    console.log('✅ Persistence verified: Bank changed to KBANK 098-7-65432-1 and other channels disabled');
  } else {
    throw new Error('Persistence mismatch: ' + JSON.stringify(savedPayments));
  }

  // 4. Test Top-up Protection on Disabled Channels
  console.log('\n[TEST 4] Testing rejection of disabled channels...');
  
  // TrueMoney voucher topup (should fail)
  const voucherRes = await request('/api/topup/voucher', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ voucherUrl: 'https://gift.truemoney.com/campaign/?v=demo50' })
  });
  if (voucherRes.status === 400 && voucherRes.data.error.includes('ปิดปรับปรุงชั่วคราว')) {
    console.log('✅ TrueMoney correctly rejected when disabled: ' + voucherRes.data.error);
  } else {
    throw new Error('Expected 400 for disabled TrueMoney, got: ' + voucherRes.status + ' ' + JSON.stringify(voucherRes.data));
  }

  // TrueCard topup (should fail)
  const cardRes = await request('/api/topup/card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ cardPin: '12345678901234', amount: 50 })
  });
  if (cardRes.status === 400 && cardRes.data.error.includes('ปิดปรับปรุงชั่วคราว')) {
    console.log('✅ TrueCard correctly rejected when disabled: ' + cardRes.data.error);
  } else {
    throw new Error('Expected 400 for disabled TrueCard, got: ' + cardRes.status + ' ' + JSON.stringify(cardRes.data));
  }

  // Coupon topup (should fail)
  const couponRes = await request('/api/topup/coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ code: 'DEKTHEP50' })
  });
  if (couponRes.status === 400 && couponRes.data.error.includes('ปิดปรับปรุงชั่วคราว')) {
    console.log('✅ Coupon correctly rejected when disabled: ' + couponRes.data.error);
  } else {
    throw new Error('Expected 400 for disabled Coupon, got: ' + couponRes.status + ' ' + JSON.stringify(couponRes.data));
  }

  // 5. Test Enabled Bank Transfer
  console.log('\n[TEST 5] Testing Bank Transfer with newly configured bank account...');
  const bankTopupRes = await request('/api/topup/bank', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ amount: 150, transferTime: '18:30', slipRef: 'KBANK_TEST_001' })
  });
  if (bankTopupRes.status === 200 && bankTopupRes.data.success) {
    console.log('✅ Bank topup succeeded: ' + bankTopupRes.data.message);
  } else {
    throw new Error('Bank topup failed: ' + JSON.stringify(bankTopupRes.data));
  }

  // Verify History transaction details contains new bank name & account
  const histRes = await request('/api/history', {
    headers: { 'Cookie': cookie }
  });
  const latestTx = histRes.data.transactions[histRes.data.transactions.length - 1];
  console.log('   Transaction detail recorded:', latestTx.details);
  if (latestTx.details.includes('ธนาคารกสิกรไทย (KBANK)') && latestTx.details.includes('098-7-65432-1')) {
    console.log('✅ Transaction dynamically recorded the new bank name and account number!');
  } else {
    throw new Error('Transaction details did not contain new bank info: ' + latestTx.details);
  }

  // 6. Restore Default Payments (GSB & enable all channels)
  console.log('\n[TEST 6] Restoring and enabling all payment channels...');
  const restoredPayments = {
    bank: {
      enabled: true,
      bankCode: 'GSB',
      bankName: 'ธนาคารออมสิน (GSB)',
      accountNo: '020463192979',
      accountName: 'ด.ช. ไออ้อน ขันธพาลี',
      promptpayNo: '020463192979',
      qrImage: '',
      note: 'โอนเงินแล้วกรอกเวลาและเลขอ้างอิงสลิป ระบบตรวจสอบและปรับยอดเงินอัตโนมัติ'
    },
    truemoney: {
      enabled: true,
      phone: '0822847225',
      feePercent: 2.9,
      minAmount: 10,
      note: 'ซองของขวัญ TrueMoney Wallet กรอกลิงก์ซองเพื่อเติมเงินทันที'
    },
    truecard: {
      enabled: true,
      note: 'บัตรเงินสด TrueMoney 14 หลัก เติมง่าย รวดเร็ว 24 ชม.'
    },
    coupon: {
      enabled: true,
      note: 'โค้ดคูปองกิจกรรมหรือโค้ดเติมเงินจากแอดมิน'
    }
  };

  await request('/api/admin/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'dekthep_admin_2026'
    },
    body: JSON.stringify({ payments: restoredPayments })
  });

  // Test TrueMoney voucher again now that it is re-enabled
  const voucherRes2 = await request('/api/topup/voucher', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ voucherUrl: 'https://gift.truemoney.com/campaign/?v=demo100' })
  });
  if (voucherRes2.status === 200 && voucherRes2.data.success) {
    console.log('✅ Re-enabled TrueMoney voucher succeeds: ' + voucherRes2.data.message);
  } else {
    throw new Error('Re-enabled TrueMoney failed: ' + JSON.stringify(voucherRes2.data));
  }

  console.log('\n🎉 ALL PAYMENT BACKOFFICE AND FRONTEND INTEGRATION TESTS PASSED 100%!');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
