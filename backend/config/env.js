const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const REQUIRED_VARIABLES = ['MONGO_URI', 'JWT_SECRET', 'TMDB_API_KEY'];

/**
 * Fail fast at startup if a secret is missing, instead of crashing
 * later in the middle of a request.
 */
function assertEnv() {
  const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy backend/.env.example to backend/.env and fill in the values.'
    );
  }
}

// CLIENT_URL may contain several comma separated origins (local + production).
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

module.exports = {
  assertEnv,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '7d',
  tmdbApiKey: process.env.TMDB_API_KEY,
  clientUrls,
};
