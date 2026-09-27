const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const env = require('../config/env');

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

async function register({ email, password, name, role = 'DEVELOPER' }) {
  const existingUser = await db.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await db.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role
    }
  });

  const token = generateToken(newUser);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt
    },
    token
  };
}

async function login({ email, password }) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  };
}

async function getProfile(userId) {
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}

module.exports = {
  register,
  login,
  getProfile,
  generateToken
};
