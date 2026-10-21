const https = require('https');

https.get('https://dekthepstore.dekhere.pro/store?category=6', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Store category page fetched, length:', data.length);

    // Extract main sections
    const headings = [...data.matchAll(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log('\nHeadings on /store?category=6:');
    console.log(headings);

    // Extract buttons or filters on store page
    const filterMatches = [...data.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log('\nButtons:');
    console.log([...new Set(filterMatches)].slice(0, 20));

    // Look for category pills or tabs
    const pills = [...data.matchAll(/class=["'][^"']*tab[^"']*["'][^>]*>(.*?)<\//gis)].map(m => m[0]);
    console.log('\nTabs:', pills.slice(0, 10));

    // Look around "หมวดหมู่" or category selector
    const idx = data.indexOf('หมวดหมู่');
    if (idx !== -1) {
      console.log('\nAround หมวดหมู่ on store page:');
      console.log(data.substring(idx - 100, idx + 1200));
    }
  });
}).on('error', console.error);
