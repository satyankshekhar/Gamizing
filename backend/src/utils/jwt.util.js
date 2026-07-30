const jwt = require('jsonwebtoken');
const env = require('../config/env');
const crypto = require('crypto');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiry }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiry }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
