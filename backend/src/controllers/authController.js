const { z } = require('zod');
const authService = require('../services/authService');

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(['ADMIN', 'DEVELOPER']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

async function register(req, res, next) {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await authService.register(validated);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.login(validated);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  me,
  registerSchema,
  loginSchema
};
