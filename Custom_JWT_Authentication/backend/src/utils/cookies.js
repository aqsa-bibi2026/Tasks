import { env } from '../config/env.js';

export const authCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSecure ? 'none' : 'lax',
  maxAge: 60 * 60 * 1000,
  path: '/'
};

export function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, authCookieOptions);
}

export function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? 'none' : 'lax',
    path: '/'
  });
}
