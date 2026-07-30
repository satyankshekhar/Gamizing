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
};\n