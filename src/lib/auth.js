import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../config.js';

const { scrypt } = config.auth.crypto;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(scrypt.saltLength).toString('hex');
  const hash = crypto.scryptSync(password, salt, scrypt.hashLength, {
    N: scrypt.cost,
    r: scrypt.blockSize,
    p: scrypt.parallelization,
    maxmem: scrypt.maxmem,
  }).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password, hashedPassword) {
  const [salt, hash] = hashedPassword.split(':');
  const hashVerify = crypto.scryptSync(password, salt, scrypt.hashLength, {
    N: scrypt.cost,
    r: scrypt.blockSize,
    p: scrypt.parallelization,
    maxmem: scrypt.maxmem,
  }).toString('hex');
  return hash === hashVerify;
}

export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}
