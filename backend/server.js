const { assertEnv, port, nodeEnv } = require('./config/env');

assertEnv();

const app = require('./app');
const connectDatabase = require('./config/db');

async function start() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`CineVerse API running on port ${port} (${nodeEnv})`);
  });
}

start().catch((error) => {
  console.error('Failed to start the server:', error.message);
  process.exit(1);
});
