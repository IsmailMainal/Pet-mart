const { sequelize, Product, Invoice, InvoiceItem } = require('./models');
const invoiceController = require('./controllers/invoiceController');

// We need to bypass catchAsync wrapper for testing or mock res/next properly
const rawCreateInvoice = async (req, res, next) => {
  const { items, ...invoiceData } = req.body;
  
  const result = await sequelize.transaction(async (t) => {
    const count = await Invoice.count({ transaction: t });
    const invoiceNumber = `INV-TEST-${Date.now()}`;
    
    const invoice = await Invoice.create({ ...invoiceData, invoiceNumber, createdBy: req.user.id }, { transaction: t });
    
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.productId) {
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (product) {
            await product.update({ quantity: product.quantity - item.quantity }, { transaction: t });
          }
        }
        await InvoiceItem.create({ ...item, invoiceId: invoice.id }, { transaction: t });
      }
    }
    return invoice;
  });
  return result;
};

const test = async () => {
  try {
    const prodBefore = await Product.findByPk(1);
    console.log('Stock Before:', prodBefore.quantity);
    
    await rawCreateInvoice({
      user: { id: 1 },
      body: {
        customerName: 'Test Customer',
        status: 'Paid',
        subtotal: 1000,
        tax: 50,
        total: 1050,
        items: [{ itemName: 'Test Product', quantity: 3, price: 500, productId: 1 }]
      }
    });
    
    const prodAfter = await Product.findByPk(1);
    console.log('Stock After:', prodAfter.quantity);
    
    if (prodBefore.quantity - 3 === prodAfter.quantity) {
      console.log('✅ Deduction logic works perfectly in RAW mode!');
    } else {
      console.log('❌ Deduction logic failed in RAW mode!');
    }
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
};

test();
