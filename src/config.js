import dotenv from 'dotenv';

dotenv.config();

const server = {
  url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
  host: process.env.HOST || "0.0.0.0",
  port: process.env.PORT || 3000,
  secure: process.env.SECURE || false,
  cors: process.env.CORS || ""
};

const database = {
  dialect: process.env.DATABASE_DIALECT || "mysql",
  database: process.env.DATABASE_DBNAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  ssl: process.env.DATABASE_SSL || false
};

const auth = {
  accessToken: {
    type: process.env.ACCESS_TOKEN_TYPE || "Bearer",
    algorithm: process.env.ACCESS_TOKEN_ALGORITHM || "HS256",
    secret: process.env.ACCESS_TOKEN_SECRET || "Acc3ssTok3nS3c3t!",
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN_MS || 60 * 60 * 1000, // 60 minutes
    audience: process.env.ACCESS_TOKEN_AUDIENCE || "my_backend_api", // Audience claim of the JWT
    issuer: process.env.ACCESS_TOKEN_ISSUER || "my_authentication_server" // Issuer claim of the JWT
  },
  crypto: {
    scrypt: {
      saltLength: process.env.SCRYPT_SALT_LENGTH || 16, // 16-bytes salt
      hashLength: process.env.SCRYPT_HASH_LENGTH || 64, // 64 characters hash
      cost: process.env.SCRYPT_COST || Math.pow(2, 17), // amount of CPU/memory used
      blockSize: process.env.SCRYPT_BLOCK_SIZE || 8, // 1024 bytes memory blocks
      parallelization: process.env.SCRYPT_PARALLELIZATION || 1, // nb of concurrent threads
      maxmem: process.env.SCRYPT_MAXMEM | 134220800 // maximum memory used by the algorithm. Slightly above 128MB (ie, 128 * blockSize * cost * parallelization = 134,217,728 bytes)
    },
    unsaltedHashAlgorithm: process.env.FAST_HASH_ALGORITHM || "sha256"
  }
};

export default {
  auth,
  database,
  server,
};
