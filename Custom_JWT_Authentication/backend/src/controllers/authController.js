import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { signAccessToken } from '../utils/jwt.js';
import { clearAuthCookie, setAuthCookie } from '../utils/cookies.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  created_at: user.created_at
});

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function validateRegistration(name, email, password) {
  const errors = [];

  if (!name || String(name).trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Enter a valid email address.');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.push('Password must contain at least one letter and one number.');
  }

  return errors;
}

export async function register(req, res, next) {
  try {
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    const validationErrors = validateRegistration(name, email, password);

    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        message: validationErrors[0],
        errors: validationErrors
      });
    }

    const { data: existingUser, error: lookupError } = await supabaseAdmin
      .from('jwt_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabaseAdmin
      .from('jwt_users')
      .insert({
        name,
        email,
        password_hash: passwordHash
      })
      .select('id, name, email, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }
      throw error;
    }

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const { data: user, error } = await supabaseAdmin
      .from('jwt_users')
      .select('id, name, email, password_hash, created_at')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Login successful.',
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  return res.json({
    success: true,
    user: publicUser(req.user)
  });
}

export async function logout(req, res) {
  clearAuthCookie(res);

  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}
