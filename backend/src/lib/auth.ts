import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'

export type UserRole = 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CLIENT'

export interface AuthTokenPayload {
  sub: string
  email: string
  role: UserRole
  tokenType: 'access' | 'refresh'
  jti?: string
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = createHmac('sha256', salt).update(password).digest('hex')
  return { salt, hash: `${salt}:${hash}` }
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expected] = storedHash.split(':')
  if (!salt || !expected) return false

  const actual = createHmac('sha256', salt).update(password).digest('hex')
  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
}

export function signAccessToken(payload: Omit<AuthTokenPayload, 'tokenType'>) {
  return jwt.sign({ ...payload, tokenType: 'access' }, env.JWT_SECRET, { expiresIn: '15m', algorithm: 'HS256' })
}

export function signRefreshToken(payload: Omit<AuthTokenPayload, 'tokenType'>) {
  return jwt.sign({ ...payload, tokenType: 'refresh' }, env.JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as AuthTokenPayload
}

export function newSessionId() {
  return randomBytes(24).toString('hex')
}