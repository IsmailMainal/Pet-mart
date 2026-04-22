const axios = require('axios');

const test = async () => {
  try {
    // 1. Login to get token
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@petsmart.com',
      password: 'password123'
    });
    const token = login.data.token;
    
    // 2. Create an invoice with a product (ID 1 is Royal Canin from seed)
    const res = await axios.post('http://localhost:3000/api/invoices', {
      customerName: 'Test Customer',
      status: 'Paid',
      subtotal: 3850,
      tax: 192.5,
      total: 4042.5,
      items: [
        { itemName: 'Royal Canin Feline Health', quantity: 2, price: 3850, productId: 1 }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Invoice created:', res.data.invoiceNumber);
    
    // 3. Check product stock
    const prod = await axios.get('http://localhost:3000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const item = prod.data.find(p => p.id === 1);
    console.log('Current Stock of Product 1:', item.quantity);
    
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
};

test();
