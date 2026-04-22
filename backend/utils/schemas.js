const { z } = require('zod');

const authSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
});

const productSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name is required"),
    price: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().positive("Price must be positive")),
    quantity: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().int().min(0, "Quantity cannot be negative")),
    description: z.string().optional(),
    imageUrls: z.any().optional(),
  })
});

const serviceSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Service name is required"),
    price: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().positive("Price must be positive")),
    description: z.string().optional(),
  })
});

const invoiceSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, "Customer name is required"),
    phone: z.string().optional(),
    status: z.enum(['Draft', 'Paid', 'Cancelled']).optional(),
    subtotal: z.preprocess((val) => (val === '' ? 0 : val), z.coerce.number()),
    tax: z.preprocess((val) => (val === '' ? 0 : val), z.coerce.number()),
    total: z.preprocess((val) => (val === '' ? 0 : val), z.coerce.number()),
    discountAmount: z.preprocess((val) => (val === '' ? 0 : val), z.coerce.number().optional()),
    discountType: z.enum(['FLAT', 'PERCENTAGE']).nullable().optional(),
    couponCode: z.string().nullable().optional(),
    paymentMode: z.enum(['CASH', 'ONLINE']).optional(),
    utrNumber: z.string().nullable().optional(),
    doctorId: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().int().nullable().optional()),
    doctorCharges: z.preprocess((val) => (val === '' ? 0 : val), z.coerce.number().min(0).optional()),
    items: z.array(z.object({
      itemName: z.string().min(1),
      quantity: z.preprocess((val) => (val === '' ? 1 : val), z.coerce.number().int().min(1)),
      price: z.preprocess((val) => (val === '' ? 0 : val), z.coerce.number().min(0)),
      productId: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().nullable().optional()),
    })).min(1, "At least one item is required")
  })
});

const appointmentSchema = z.object({
  body: z.object({
    doctorId: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().int().optional()),
    date: z.string().optional(),
    time: z.string().optional(),
    reason: z.string().optional(),
    status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']).optional(),
  })
});

const updateAppointmentSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']).optional(),
    doctorId: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().int().optional()),
    date: z.string().optional(),
    time: z.string().optional(),
    reason: z.string().optional(),
  }).passthrough()
});

module.exports = {
  authSchema,
  productSchema,
  serviceSchema,
  invoiceSchema,
  appointmentSchema,
  updateAppointmentSchema
};
