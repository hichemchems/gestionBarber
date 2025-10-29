import jwt from 'jsonwebtoken';
import config from '../config.js';

const { accessToken } = config.auth;

export function generateAccessToken(payload) {
  return jwt.sign(payload, accessToken.secret, {
    algorithm: accessToken.algorithm,
    expiresIn: accessToken.expiresIn,
    audience: accessToken.audience,
    issuer: accessToken.issuer,
  });
}

export function verifyJwtToken(token) {
  try {
    return jwt.verify(token, accessToken.secret, {
      algorithms: [accessToken.algorithm],
      audience: accessToken.audience,
      issuer: accessToken.issuer,
    });
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}
