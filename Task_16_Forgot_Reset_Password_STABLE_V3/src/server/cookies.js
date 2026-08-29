import { env } from './config.js';

const authCookie = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSecure ? 'none' : 'lax',
  path: '/',
  maxAge: 2 * 60 * 60 * 1000
};

export function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, authCookie);
}

export function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? 'none' : 'lax',
    path: '/'
  });
}
