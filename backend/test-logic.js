const { sequelize, Product, Invoice, InvoiceItem } = require('./models');
const { createInvoice } = require('./controllers/invoiceController');

const mockReq = {
  user: { id: 1 },
  body: {
    customerName: 'Test Customer',
    status: 'Paid',
    subtotal: 1000,
    tax: 50,
    total: 1050,
    items: [
      { itemName: 'Royal Canin Feline Health', quantity: 2, price: 500, productId: 1 }
    ]
  }
};

const mockRes = {
  status: function(s) { this.statusCode = s; return this; },
  json: function(data) { this.data = data; console.log('Response:', JSON.stringify(data, null, 2)); }
};

const test = async () => {
  try {
    const prodBefore = await Product.findByPk(1);
    console.log('Stock Before:', prodBefore.quantity);
    
    await createInvoice(mockReq, mockRes, (err) => { if(err) console.error('Error:', err); });
    
    const prodAfter = await Product.findByPk(1);
    console.log('Stock After:', prodAfter.quantity);
    
    if (prodBefore.quantity - 2 === prodAfter.quantity) {
      console.log('✅ Deduction logic works perfectly!');
    } else {
      console.log('❌ Deduction logic failed!');
    }
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
};

test();
