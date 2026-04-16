import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Tenant from './auth.model.js';
import AppError from '../../lib/AppError.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../../lib/jwt.js';

const BCRYPT_ROUNDS = 12;

function tenantPayload(tenant) {
  return { sub: tenant._id.toString() };
}

export async function register(body) {
  const { name, email, password } = body;
  const normalizedEmail = email.toLowerCase();
  const existing = await Tenant.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const tenant = await Tenant.create({
    name,
    email: normalizedEmail,
    passwordHash,
  });

  const accessToken = signAccessToken(tenantPayload(tenant));
  const refreshToken = signRefreshToken(tenantPayload(tenant));

  tenant.refreshToken = refreshToken;
  await tenant.save();

  return {
    tenant: tenant.toJSON(),
    accessToken,
    refreshToken,
  };
}

export async function login(body) {
  const { email, password } = body;
  const tenant = await Tenant.findOne({ email: email.toLowerCase() });
  if (!tenant || !tenant.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  const match = await bcrypt.compare(password, tenant.passwordHash);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = signAccessToken(tenantPayload(tenant));
  const refreshToken = signRefreshToken(tenantPayload(tenant));

  tenant.refreshToken = refreshToken;
  await tenant.save();

  return {
    tenant: tenant.toJSON(),
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(body) {
  const { refreshToken } = body;
  let payload;
  try {
    payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const tenant = await Tenant.findById(payload.sub);
  if (!tenant || tenant.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  return {
    accessToken: signAccessToken(tenantPayload(tenant)),
  };
}

export async function logout(body) {
  const { refreshToken } = body;
  let payload;
  try {
    payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const tenant = await Tenant.findById(payload.sub);
  if (!tenant || tenant.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  tenant.refreshToken = null;
  await tenant.save();

  return { loggedOut: true };
}

export async function generateApiKey(req) {
  const tenantId = req.tenant.sub || req.tenant._id;
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  const apiKeyId = crypto.randomBytes(8).toString('hex');
  const apiKeySecret = crypto.randomBytes(24).toString('hex');
  const rawKey = `${apiKeyId}.${apiKeySecret}`;
  tenant.apiKeyId = apiKeyId;
  tenant.apiKeyHash = await bcrypt.hash(rawKey, BCRYPT_ROUNDS);
  await tenant.save();

  return { apiKey: rawKey };
}
