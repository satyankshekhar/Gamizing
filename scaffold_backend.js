const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'backend', 'src');

const directories = [
  'config',
  'controllers',
  'middleware',
  'models',
  'routes',
  'services',
  'utils',
  'validators',
  'database'
];

directories.forEach(dir => {
  fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
});

const files = {
  'config/env.js': `
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gamizing',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  nodeEnv: process.env.NODE_ENV || 'development'
};
  `,
  'database/connection.js': `
const mongoose = require('mongoose');
const env = require('../config/env');

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
  `,
  'models/User.js': `
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require('../config/env');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: null },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastLogin: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
  `,
  'models/RefreshToken.js': `
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  replacedByToken: { type: String, default: null }
}, {
  timestamps: true
});

// Check if token is active
refreshTokenSchema.virtual('isActive').get(function() {
  return !this.revokedAt && !this.isExpired;
});

refreshTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt;
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
  `,
  'validators/auth.validator.js': `
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().trim(),
  username: Joi.string().required().trim().min(3).max(30),
  email: Joi.string().required().trim().email(),
  password: Joi.string().required().min(6),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({ 'any.only': 'Passwords do not match' })
});

const loginSchema = Joi.object({
  email: Joi.string().required().trim().email(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};
  `,
  'middleware/validate.js': `
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map(detail => detail.message).join(', ')
    });
  }
  next();
};
module.exports = validate;
  `,
  'middleware/auth.middleware.js': `
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
    
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

module.exports = { protect };
  `,
  'utils/jwt.util.js': `
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
  `,
  'services/auth.service.js': `
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
  `,
  'controllers/auth.controller.js': `
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
  `,
  'routes/auth.routes.js': `
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
  `,
  'routes/index.js': `
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.use('/auth', authRoutes);

module.exports = router;
  `,
  'app.js': `
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const env = require('./config/env');

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.clientUrl,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100 // limit each IP
});
app.use('/api', limiter);

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
  `,
  'server.js': `
const app = require('./app');
const connectDB = require('./database/connection');
const env = require('./config/env');

connectDB().then(() => {
  app.listen(env.port, () => {
    console.log(\`Server running in \${env.nodeEnv} mode on port \${env.port}\`);
  });
});
  `
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filename), content.trim() + '\\n');
}

fs.writeFileSync(path.join(__dirname, 'backend', '.env'), `
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gamizing
JWT_ACCESS_SECRET=supersecretaccesskey_gamizing2026
JWT_REFRESH_SECRET=supersecretrefreshkey_gamizing2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
CLIENT_URL=http://localhost:5173
BCRYPT_SALT_ROUNDS=12
NODE_ENV=development
`.trim() + '\n');

// Also update backend package.json to have a start script
const pkgPath = path.join(__dirname, 'backend', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts.start = "node src/server.js";
pkg.scripts.dev = "nodemon src/server.js";
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log('Backend scaffolding complete.');
