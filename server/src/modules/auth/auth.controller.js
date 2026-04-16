import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const data = await authService.refreshTokens(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const data = await authService.logout(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function apiKey(req, res, next) {
  try {
    const data = await authService.generateApiKey(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
