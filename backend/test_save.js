const http = require('http');

async function testSave() {
  try {
    const loginRes = await fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bhavanbadhe@gmail.com', password: 'bhavan@123' })
    });
    
    console.log('Login Status:', loginRes.status);
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Cookies:', cookies);
    
    if (loginRes.status === 200) {
      const createRes = await fetch('http://127.0.0.1:8000/api/catalogs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({ name: 'Test Catalog', settings: {} })
      });
      
      console.log('Create Catalog Status:', createRes.status);
      const createBody = await createRes.json();
      console.log('Create Catalog Body:', createBody);
      
      if (createRes.status === 201) {
        const catalogId = createBody.id;
        const savePageRes = await fetch(`http://127.0.0.1:8000/api/catalogs/${catalogId}/save_page/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies
          },
          body: JSON.stringify({
            pageNumber: 1,
            type: 'interior',
            elements: [],
            categoryId: null
          })
        });
        console.log('Save Page Status:', savePageRes.status);
        console.log('Save Page Body:', await savePageRes.text());
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testSave();
