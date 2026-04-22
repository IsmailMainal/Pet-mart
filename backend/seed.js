const { sequelize, User, Product, ProductImage, Doctor, Service, Appointment, Invoice, InvoiceItem } = require('./models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('⏳ Seeding dummy data with INR (₹) prices...');
    await sequelize.sync({ force: true });
    
    const hashedPassword = bcrypt.hashSync('password123', 10);
    
    // Users
    const admin = await User.create({ name: 'Admin User', email: 'admin@petsmart.com', password: hashedPassword, role: 'admin' });
    const recep = await User.create({ name: 'Sarah Miller', email: 'sarah@petsmart.com', password: hashedPassword, role: 'receptionist' });
    const cust1 = await User.create({ name: 'John Doe', email: 'john@example.com', password: hashedPassword, role: 'customer' });
    const cust2 = await User.create({ name: 'Emma Watson', email: 'emma@example.com', password: hashedPassword, role: 'customer' });
    
    // Doctors
    const doctors = await Doctor.bulkCreate([
      { name: 'Dr. Sarah Wilson', specialization: 'Senior Veterinarian', experience: 12, availability: 'Mon-Fri' },
      { name: 'Dr. James Miller', specialization: 'Pet Surgeon', experience: 8, availability: 'Tue-Sat' }
    ]);

    // Services (INR Prices)
    const services = await Service.bulkCreate([
      { name: 'Annual Health Check', description: 'Complete physical exam.', price: 1500.00 },
      { name: 'Vaccination Package', description: 'Core vaccines for dogs and cats.', price: 2500.00 },
      { name: 'Dental Scaling', description: 'Professional teeth cleaning.', price: 4500.00 },
      { name: 'Full Grooming', description: 'Bath, haircut, and nail trimming.', price: 1800.00 },
      { name: 'X-Ray Imaging', description: 'Digital radiography.', price: 3200.00 }
    ]);
    
    // Products (INR Prices)
    const productData = [
      { name: 'Royal Canin Feline Health', price: 3850.00, qty: 25, imgs: ['https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800'] },
      { name: 'Purina Pro Plan Dog Food', price: 4200.00, qty: 15, imgs: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800'] },
      { name: 'Orthopedic Dog Bed', price: 5500.00, qty: 10, imgs: ['https://images.unsplash.com/photo-1541591047357-ac21f1295abb?w=800'] },
      { name: 'Cat Scratching Post', price: 1200.00, qty: 20, imgs: ['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800'] },
      { name: 'Interactive Laser Toy', price: 450.00, qty: 50, imgs: ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800'] },
      { name: 'Premium Bird Seed', price: 850.00, qty: 40, imgs: ['https://images.unsplash.com/photo-1552728089-57bdde30fc3b?w=800'] },
      { name: 'Grooming Brush Set', price: 650.00, qty: 30, imgs: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800'] }
    ];

    for (const p of productData) {
      const prod = await Product.create({ name: p.name, price: p.price, quantity: p.qty, description: `Premium ${p.name.toLowerCase()} for your pet.` });
      for (const img of p.imgs) {
        await ProductImage.create({ productId: prod.id, imageUrl: img });
      }
    }

    // Invoices (INR Prices)
    const invoiceData = [
      { num: 'INV-2026-0001', cust: 'John Doe', sub: 5350, tax: 267.5, total: 5617.5, stat: 'Paid', creator: admin.id, items: [{ name: 'Royal Canin Feline Health', p: 3850, q: 1, pid: 1 }, { name: 'Annual Health Check', p: 1500, q: 1, pid: null }] },
      { num: 'INV-2026-0002', cust: 'Emma Watson', sub: 1800, tax: 90, total: 1890, stat: 'Paid', creator: recep.id, items: [{ name: 'Full Grooming', p: 1800, q: 1, pid: null }] }
    ];

    for (const i of invoiceData) {
      const inv = await Invoice.create({ invoiceNumber: i.num, customerName: i.cust, subtotal: i.sub, tax: i.tax, total: i.total, status: i.stat, createdBy: i.creator });
      for (const item of i.items) {
        await InvoiceItem.create({ invoiceId: inv.id, itemName: item.name, price: item.p, quantity: item.q, total: item.p * item.q, productId: item.pid });
      }
    }

    console.log('✅ INR dummy data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
