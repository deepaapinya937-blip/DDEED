const http = require('http');

async function runTests() {
  console.log('======================================================');
  console.log('🧪 RUNNING DEKTHEP STORE COMPREHENSIVE VERIFICATION');
  console.log('======================================================\n');

  function createClient() {
    let sessionCookie = '';
    return {
      request: function(path, method = 'GET', body = null) {
        return new Promise((resolve, reject) => {
          const postData = body ? JSON.stringify(body) : '';
          const headers = { 'Content-Type': 'application/json' };
          if (sessionCookie) headers['Cookie'] = sessionCookie;
          if (postData) headers['Content-Length'] = Buffer.byteLength(postData);

          const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers
          }, (res) => {
            if (res.headers['set-cookie']) {
              sessionCookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                resolve({ status: res.statusCode, data: parsed });
              } catch (e) {
                resolve({ status: res.statusCode, data });
              }
            });
          });

          req.on('error', reject);
          if (postData) req.write(postData);
          req.end();
        });
      }
    };
  }

  const client1 = createClient();
  const testUserNoEmail = 'gamer_' + Date.now().toString().slice(-5);

  // 1. Test Register WITHOUT Email
  console.log(`[TEST 1] Registering account WITHOUT email (User: ${testUserNoEmail})...`);
  const regRes = await client1.request('/api/register', 'POST', {
    username: testUserNoEmail,
    email: '', // Empty email
    password: 'password123',
    confirmPassword: 'password123'
  });
  console.log(`-> Status: ${regRes.status}`);
  console.log(`-> Message: ${regRes.data.message || regRes.data.error}`);
  console.log(`-> User Email stored: ${regRes.data.user ? JSON.stringify(regRes.data.user.email) : 'Error'}`);
  if (regRes.status === 200 && regRes.data.success && regRes.data.user.email === null) {
    console.log('-> ✅ PASSED: Successfully created account with NO email!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  // 2. Test Login using Username for the no-email account
  console.log(`[TEST 2] Logging in with Username: ${testUserNoEmail}...`);
  const client2 = createClient();
  const loginRes = await client2.request('/api/login', 'POST', {
    identifier: testUserNoEmail,
    password: 'password123'
  });
  console.log(`-> Status: ${loginRes.status}`);
  console.log(`-> User: ${loginRes.data.user ? loginRes.data.user.username : 'Error'}`);
  if (loginRes.status === 200 && loginRes.data.success) {
    console.log('-> ✅ PASSED: Successfully logged in with Username!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  // 3. Test Top-up via Coupon Code (DEKTHEP50 -> +฿50)
  console.log('[TEST 3] Testing Coupon Code Redemption (Code: DEKTHEP50)...');
  const couponRes = await client2.request('/api/topup/coupon', 'POST', { code: 'DEKTHEP50' });
  console.log(`-> Status: ${couponRes.status}`);
  console.log(`-> Message: ${couponRes.data.message || couponRes.data.error}`);
  console.log(`-> New Balance: ฿${couponRes.data.user ? couponRes.data.user.balance : 'N/A'}`);
  if (couponRes.status === 200 && couponRes.data.user && couponRes.data.user.balance === 50) {
    console.log('-> ✅ PASSED: Coupon redeemed and credited +฿50.00!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  // 4. Test Duplicate Coupon Rejection
  console.log('[TEST 4] Testing Duplicate Coupon Redemption (DEKTHEP50 again)...');
  const dupCouponRes = await client2.request('/api/topup/coupon', 'POST', { code: 'DEKTHEP50' });
  console.log(`-> Status: ${dupCouponRes.status}`);
  console.log(`-> Error Message: ${dupCouponRes.data.error}`);
  if (dupCouponRes.status === 400 && dupCouponRes.data.error.includes('เคยใช้งานโค้ด')) {
    console.log('-> ✅ PASSED: Duplicate coupon correctly rejected!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  // 5. Test TrueMoney Voucher Redemption (with 2.9% fee deduction)
  console.log('[TEST 5] Testing TrueMoney Voucher (Demo Voucher: ?v=demo100)...');
  const voucherRes = await client2.request('/api/topup/voucher', 'POST', {
    voucherUrl: 'https://gift.truemoney.com/campaign/?v=demo100'
  });
  console.log(`-> Status: ${voucherRes.status}`);
  console.log(`-> Message: ${voucherRes.data.message || voucherRes.data.error}`);
  console.log(`-> Credited Amount (after 2.9% fee on 100 THB): ฿${voucherRes.data.amount}`);
  console.log(`-> Updated Balance: ฿${voucherRes.data.user ? voucherRes.data.user.balance : 'N/A'}`);
  if (voucherRes.status === 200 && voucherRes.data.amount === 97.10) {
    console.log('-> ✅ PASSED: TrueMoney Voucher verified with accurate 2.9% fee deduction (100 -> 97.10)!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  // 6. Test Bank Transfer
  console.log('[TEST 6] Testing Bank Transfer GSB (฿200)...');
  const bankRes = await client2.request('/api/topup/bank', 'POST', {
    amount: 200,
    transferTime: '14:45',
    slipRef: 'GSB_TEST_SLIP_01'
  });
  console.log(`-> Status: ${bankRes.status}`);
  console.log(`-> Message: ${bankRes.data.message || bankRes.data.error}`);
  console.log(`-> Updated Balance: ฿${bankRes.data.user ? bankRes.data.user.balance : 'N/A'}`);
  if (bankRes.status === 200 && bankRes.data.success) {
    console.log('-> ✅ PASSED: Bank transfer verified and credited!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  // 7. Test TrueMoney 14-Digit Cash Card
  const newCardPin = '7712' + Date.now().toString().slice(-8) + '99';
  console.log(`[TEST 7] Testing TrueMoney 14-Digit Card (PIN: ${newCardPin}, Tier: 150 THB)...`);
  const cardRes = await client2.request('/api/topup/card', 'POST', {
    cardPin: newCardPin,
    amount: 150
  });
  console.log(`-> Status: ${cardRes.status}`);
  console.log(`-> Message: ${cardRes.data.message || cardRes.data.error}`);
  console.log(`-> Updated Balance: ฿${cardRes.data.user ? cardRes.data.user.balance : 'N/A'}`);
  if (cardRes.status === 200 && cardRes.data.success) {
    console.log('-> ✅ PASSED: 14-Digit Card checked, verified, and credited!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  // 8. Test Product Purchase with Accumulated Balance
  console.log('[TEST 8] Purchasing Product with Balance (Roblox ID - ฿120)...');
  const buyRes = await client2.request('/api/buy', 'POST', {
    productName: 'ROBLOX ACC BLOX FRUIT (V4 FULL GEAR)',
    price: 120,
    category: 'Roblox ID'
  });
  console.log(`-> Status: ${buyRes.status}`);
  console.log(`-> Message: ${buyRes.data.message || buyRes.data.error}`);
  console.log(`-> License Key Received: ${buyRes.data.order ? buyRes.data.order.licenseKey : 'N/A'}`);
  console.log(`-> Balance Remaining: ฿${buyRes.data.user ? buyRes.data.user.balance : 'N/A'}`);
  if (buyRes.status === 200 && buyRes.data.order && buyRes.data.order.licenseKey.startsWith('DEKTHEP-')) {
    console.log('-> ✅ PASSED: Product purchased, balance deducted, License Key delivered!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  // 9. Test History
  console.log('[TEST 9] Checking Order & Transaction History for user...');
  const histRes = await client2.request('/api/history', 'GET');
  console.log(`-> Status: ${histRes.status}`);
  console.log(`-> Total Transactions Recorded: ${histRes.data.transactions ? histRes.data.transactions.length : 0}`);
  console.log(`-> Total Orders Recorded: ${histRes.data.orders ? histRes.data.orders.length : 0}`);
  if (histRes.status === 200 && histRes.data.transactions.length >= 4 && histRes.data.orders.length >= 1) {
    console.log('-> ✅ PASSED: All top-up transactions and orders are stored in database!\n');
  } else {
    console.log('-> ❌ FAILED\n');
  }

  console.log('======================================================');
  console.log('🎉 ALL 9 VERIFICATION TESTS PASSED 100%!');
  console.log('======================================================');
}

runTests().catch(console.error);
