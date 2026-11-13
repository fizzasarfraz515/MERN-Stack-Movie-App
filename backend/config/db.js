const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDatabase() {
  const connection = await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
}

module.exports = connectDatabase;
