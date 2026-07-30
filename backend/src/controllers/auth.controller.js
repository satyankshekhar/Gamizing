const authService = require('../services/auth.service');
const env = require('../config/env');

const setTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

const register = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
    setTokenCookie(res, refreshToken);
    
    const userObj = user.toObject();
    delete userObj.passwordHash;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userObj,
      accessToken
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
    
    setTokenCookie(res, refreshToken);
    
    const userObj = user.toObject();
    delete userObj.passwordHash;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userObj,
      accessToken
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token not found' });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAuthToken(refreshToken);
    setTokenCookie(res, newRefreshToken);
    
    res.json({ success: true, accessToken });
  } catch (error) {
    res.clearCookie('refreshToken');
    res.status(401).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logoutUser(refreshToken);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error during logout' });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe
};
