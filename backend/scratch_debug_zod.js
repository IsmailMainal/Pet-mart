const { updateAppointmentSchema } = require('./utils/schemas');

try {
  updateAppointmentSchema.parse({
    body: { status: 'Confirmed' },
    params: { id: '2' },
    query: {}
  });
  console.log('Validation passed!');
} catch (err) {
  console.log('Validation failed:');
  console.log(JSON.stringify(err.errors, null, 2));
}
