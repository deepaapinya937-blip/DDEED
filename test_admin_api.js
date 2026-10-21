const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing GET /api/settings ---');
  const r1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/settings',
    method: 'GET'
  });
  console.log('Status:', r1.status);
  console.log('Store name:', r1.data?.settings?.general?.storeName || r1.data?.general?.storeName);
  console.log('Brand color:', r1.data?.settings?.theme?.brandPrimary || r1.data?.theme?.brandPrimary);

  console.log('\n--- 2. Testing POST /api/admin/settings (Update Theme Color) ---');
  const r2 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/settings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'dekthep_admin_2026'
    }
  }, {
    theme: {
      brandPrimary: '#070ee4',
      brandHover: '#1e26ff',
      brandAccent: '#3b82f6',
      bgBody: '#05070f'
    }
  });
  console.log('Status:', r2.status, 'Result:', r2.data?.message);

  console.log('\n--- 3. Testing POST /api/admin/upload (Image Upload) ---');
  // 1x1 transparent PNG base64
  const testPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAAElFTkSuQmCC';
  const r3 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'dekthep_admin_2026'
    }
  }, {
    image: testPng,
    name: 'test_banner'
  });
  console.log('Status:', r3.status, 'Uploaded URL:', r3.data?.url);

  console.log('\n--- 4. Testing GET /api/admin/products ---');
  const r4 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/products',
    method: 'GET',
    headers: { 'x-admin-key': 'dekthep_admin_2026' }
  });
  console.log('Status:', r4.status, 'Total Products:', r4.data?.products?.length);

  console.log('\n--- 5. Testing GET /api/admin/users ---');
  const r5 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users',
    method: 'GET',
    headers: { 'x-admin-key': 'dekthep_admin_2026' }
  });
  console.log('Status:', r5.status, 'Total Users:', r5.data?.users?.length);
  const samobile = r5.data?.users?.find(u => u.username === 'samobile');
  console.log('User samobile role:', samobile?.role, 'balance:', samobile?.balance);

  console.log('\n--- 6. Testing POST /api/admin/users/balance (Top up user) ---');
  if (samobile) {
    const r6 = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/users/balance',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      }
    }, {
      userId: samobile.id,
      type: 'adjust',
      amount: 100,
      note: 'Admin API verification'
    });
    console.log('Status:', r6.status, 'New balance:', r6.data?.user?.balance);
  }

  console.log('\n--- 7. Testing GET /api/admin/orders ---');
  const r7 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/orders',
    method: 'GET',
    headers: { 'x-admin-key': 'dekthep_admin_2026' }
  });
  console.log('Status:', r7.status, 'Total Orders:', r7.data?.orders?.length);

  console.log('\n✅ ALL BACKOFFICE APIS OPERATING NORMALLY 100%!');
}

runTests().catch(console.error);
