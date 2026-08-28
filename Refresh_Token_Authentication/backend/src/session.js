import { db } from './db.js';
import { env } from './config.js';
import {
  hashToken, refreshExpiry, signAccess, signRefresh, verifyRefresh
} from './tokens.js';

export const publicUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  created_at: user.created_at
});

export async function getUser(id) {
  const { data, error } = await db
    .from('jwt_users')
    .select('id,name,email,created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function ip(req) {
  return String(req.headers['x-forwarded-for'] || req.ip || '')
    .split(',')[0].trim() || null;
}

async function storeRefresh(userId, token, req) {
  const { data, error } = await db
    .from('jwt_refresh_tokens')
    .insert({
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: refreshExpiry(),
      user_agent: req.get('user-agent') || null,
      ip_address: ip(req)
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function issueSession(user, req) {
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  await storeRefresh(user.id, refreshToken, req);
  return { accessToken, refreshToken };
}

export async function revokeAll(userId) {
  const { error } = await db
    .from('jwt_refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);
  if (error) throw error;
}

export async function revokeOne(rawToken) {
  if (!rawToken) return;
  const { error } = await db
    .from('jwt_refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', hashToken(rawToken))
    .is('revoked_at', null);
  if (error) throw error;
}

export async function rotate(rawToken, req) {
  const payload = verifyRefresh(rawToken);
  const { data: old, error } = await db
    .from('jwt_refresh_tokens')
    .select('id,user_id,expires_at,revoked_at')
    .eq('token_hash', hashToken(rawToken))
    .maybeSingle();

  if (error) throw error;

  if (!old) {
    const e = new Error('Refresh token is not recognized.');
    e.statusCode = 401;
    throw e;
  }

  if (old.revoked_at) {
    await revokeAll(old.user_id);
    const e = new Error('Refresh token reuse detected. All sessions revoked.');
    e.statusCode = 401;
    throw e;
  }

  if (new Date(old.expires_at) <= new Date()) {
    await db.from('jwt_refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', old.id);
    const e = new Error('Refresh token expired.');
    e.statusCode = 401;
    throw e;
  }

  if (payload.sub !== old.user_id) {
    await revokeAll(old.user_id);
    const e = new Error('Refresh token user mismatch.');
    e.statusCode = 401;
    throw e;
  }

  const user = await getUser(old.user_id);
  if (!user) {
    const e = new Error('User no longer exists.');
    e.statusCode = 401;
    throw e;
  }

  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  const replacement = await storeRefresh(user.id, refreshToken, req);

  const updated = await db
    .from('jwt_refresh_tokens')
    .update({
      revoked_at: new Date().toISOString(),
      replaced_by_token_id: replacement.id
    })
    .eq('id', old.id)
    .is('revoked_at', null);

  if (updated.error) {
    await db.from('jwt_refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', replacement.id);
    throw updated.error;
  }

  return { user, accessToken, refreshToken };
}

const baseCookie = () => ({
  httpOnly: true,
  secure: env.secureCookie,
  sameSite: env.secureCookie ? 'none' : 'lax',
  path: '/'
});

export function setSessionCookies(res, accessToken, refreshToken) {
  res.cookie(env.accessCookie, accessToken, {
    ...baseCookie(), maxAge: 15 * 60 * 1000
  });
  res.cookie(env.refreshCookie, refreshToken, {
    ...baseCookie(), maxAge: env.refreshDays * 86400000
  });
}

export function clearCookies(res) {
  res.clearCookie(env.accessCookie, baseCookie());
  res.clearCookie(env.refreshCookie, baseCookie());
}
