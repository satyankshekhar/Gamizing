const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.util');
const env = require('../config/env');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
  const { name, username, email, password } = userData;
  
  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new Error('Email already exists');
  
  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw new Error('Username already exists');
  
  const user = await User.create({
    name, username, email, passwordHash: password
  });
  
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Store refresh token
  const decodedRefresh = jwt.decode(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(decodedRefresh.exp * 1000)
  });
  
  return { user, accessToken, refreshToken };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid credentials');
  
  if (!user.isActive) throw new Error('Account has been deactivated');
  
  user.lastLogin = new Date();
  await user.save();
  
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  const decodedRefresh = jwt.decode(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(decodedRefresh.exp * 1000)
  });
  
  return { user, accessToken, refreshToken };
};

const refreshAuthToken = async (oldRefreshToken) => {
  try {
    const decoded = jwt.verify(oldRefreshToken, env.jwt.refreshSecret);
    
    const tokenDoc = await RefreshToken.findOne({ token: oldRefreshToken });
    if (!tokenDoc || !tokenDoc.isActive) {
      throw new Error('Invalid or expired refresh token');
    }
    
    // Revoke old token
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new Error('User not found or inactive');
    
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    const decodedNewRefresh = jwt.decode(newRefreshToken);
    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(decodedNewRefresh.exp * 1000)
    });
    
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { revokedAt: new Date() }
    );
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAuthToken,
  logoutUser
};
