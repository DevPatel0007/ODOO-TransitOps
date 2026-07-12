import { randomUUID } from 'node:crypto'
import express, { type Request, type Response } from 'express'
import { eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { refreshSessionsTable, usersTable } from '../db/schema.js'
import { authenticateRequest, requireAuth, sanitizeUser } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../lib/http.js'
import { hashPassword, newSessionId, signAccessToken, signRefreshToken, verifyPassword, verifyToken } from '../lib/auth.js'

export const authRouter = express.Router()

authRouter.post(
  '/register',
  asyncHandler(async (request: Request, response: Response) => {
    const { name, email, password, role } = request.body as {
      name?: string
      email?: string
      password?: string
      role?: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CLIENT'
    }

    if (!name || !email || !password) throw new ApiError('name, email, and password are required', 400)

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)
    if (existing.length > 0) throw new ApiError('User already exists', 409)

    const { hash } = hashPassword(password)
    const [user] = await db
      .insert(usersTable)
      .values({
        id: randomUUID(),
        name,
        email,
        passwordHash: hash,
        role: role ?? 'DRIVER',
      })
      .returning()

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
    const sessionId = newSessionId()
    const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role, jti: sessionId })

    await db.insert(refreshSessionsTable).values({
      userId: user.id,
      jti: sessionId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    })

    response.cookie?.('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    response.status(201).json({ user: sanitizeUser(user), accessToken })
  }),
)

authRouter.post(
  '/login',
  asyncHandler(async (request: Request, response: Response) => {
    const { email, password } = request.body as { email?: string; password?: string }
    if (!email || !password) throw new ApiError('email and password are required', 400)

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new ApiError('Invalid email or password', 401)
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
    const sessionId = newSessionId()
    const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role, jti: sessionId })

    await db.insert(refreshSessionsTable).values({
      userId: user.id,
      jti: sessionId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    })

    response.cookie?.('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    response.json({ user: sanitizeUser(user), accessToken })
  }),
)

authRouter.post(
  '/logout',
  asyncHandler(async (request: Request, response: Response) => {
    const refreshToken = request.headers.cookie?.match(/refresh_token=([^;]+)/)?.[1]
    if (refreshToken) {
      try {
        const payload = verifyToken(decodeURIComponent(refreshToken))
        if (payload.jti) {
          await db.update(refreshSessionsTable).set({ revokedAt: new Date() }).where(eq(refreshSessionsTable.jti, payload.jti))
        }
      } catch {
        // Best-effort logout.
      }
    }

    response.setHeader('Set-Cookie', 'refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax')
    response.json({ message: 'Logged out' })
  }),
)

authRouter.get(
  '/me',
  authenticateRequest,
  requireAuth,
  asyncHandler(async (request: Request, response: Response) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, request.auth!.sub)).limit(1)
    if (!user) throw new ApiError('User not found', 404)
    response.json({ user: sanitizeUser(user) })
  }),
)