import type { NextFunction, Request, Response } from 'express'

import { env } from '../config/env.js'

const buckets = new Map<string, { count: number; resetAt: number }>()

function isLocalDevelopmentOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
}

function resolveAllowedOrigin(request: Request) {
  const requestOrigin = request.headers.origin
  if (requestOrigin && (requestOrigin === env.CORS_ORIGIN || isLocalDevelopmentOrigin(requestOrigin))) {
    return requestOrigin
  }

  if (env.CORS_ORIGIN) {
    return env.CORS_ORIGIN
  }

  return requestOrigin ?? undefined
}

export function applySecurityHeaders(_request: Request, response: Response, next: NextFunction) {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Referrer-Policy', 'no-referrer')
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  next()
}

export function corsMiddleware(request: Request, response: Response, next: NextFunction) {
  const origin = resolveAllowedOrigin(request)
  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Vary', 'Origin')
  }
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')

  if (request.method === 'OPTIONS') {
    return response.sendStatus(204)
  }

  next()
}

export function requestRateLimiter(options: { windowMs: number; max: number }) {
  return (request: Request, response: Response, next: NextFunction) => {
    const key = request.ip || request.socket.remoteAddress || 'unknown'
    const now = Date.now()
    const bucket = buckets.get(key)

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs })
      return next()
    }

    bucket.count += 1
    if (bucket.count > options.max) {
      return response.status(429).json({ error: 'Too many requests' })
    }

    next()
  }
}
