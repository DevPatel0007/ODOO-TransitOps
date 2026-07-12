import type { NextFunction, Request, Response } from 'express'

import { usersTable } from '../db/schema.js'
import type { UserRole } from '../lib/auth.js'
import { ApiError } from '../lib/http.js'
import { verifyToken } from '../lib/auth.js'

function readBearerToken(request: Request) {
  const header = request.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length)
}

export function authenticateRequest(request: Request, _response: Response, next: NextFunction) {
  const token = readBearerToken(request)
  if (!token) return next()

  try {
    request.auth = verifyToken(token)
    next()
  } catch {
    next(new ApiError('Invalid or expired token', 401))
  }
}

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  if (!request.auth) return next(new ApiError('Authentication required', 401))
  next()
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.auth) return next(new ApiError('Authentication required', 401))
    if (!allowedRoles.includes(request.auth.role)) {
      return next(new ApiError('Access denied: insufficient clearance', 403))
    }
    next()
  }
}

export function sanitizeUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}