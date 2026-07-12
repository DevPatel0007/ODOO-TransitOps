import { EventEmitter } from 'node:events'
import express, { type Request, type Response } from 'express'
import { eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { telemetryPointsTable } from '../db/schema.js'
import { authenticateRequest, authorizeRoles } from '../middleware/auth.js'
import { asyncHandler } from '../lib/http.js'

const broadcaster = new EventEmitter()
const telemetryBuffer = new Map<string, Array<{ latitude: number; longitude: number; heading?: number; speed?: number; capturedAt: Date }>>()

export function startTelemetryFlushWorker() {
  setInterval(async () => {
    for (const [tripId, points] of telemetryBuffer.entries()) {
      if (points.length === 0) continue

      await db.insert(telemetryPointsTable).values(points.map((point) => ({ tripId, ...point })))
      telemetryBuffer.delete(tripId)
    }
  }, 5 * 60 * 1000).unref()
}

export const telemetryRouter = express.Router()

telemetryRouter.use(authenticateRequest)

telemetryRouter.post(
  '/trips/:tripId/ping',
  authorizeRoles('ADMIN', 'MANAGER', 'DRIVER'),
  asyncHandler(async (request: Request, response: Response) => {
    const tripId = String(request.params.tripId)
    const { latitude, longitude, heading, speed } = request.body as Record<string, number | undefined>
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      response.status(400).json({ error: 'latitude and longitude are required' })
      return
    }

    const bucket = telemetryBuffer.get(tripId) ?? []
    bucket.push({ latitude, longitude, heading, speed, capturedAt: new Date() })
    telemetryBuffer.set(tripId, bucket)
    broadcaster.emit(`trip:${tripId}`, { tripId, latitude, longitude, heading, speed })

    response.json({ message: 'Telemetry buffered' })
  }),
)

telemetryRouter.get(
  '/trips/:tripId/track',
  asyncHandler(async (request: Request, response: Response) => {
    const tripId = String(request.params.tripId)
    response.setHeader('Content-Type', 'text/event-stream')
    response.setHeader('Cache-Control', 'no-cache')
    response.setHeader('Connection', 'keep-alive')
    response.flushHeaders?.()

    const handler = (payload: unknown) => {
      response.write(`data: ${JSON.stringify(payload)}\n\n`)
    }

    broadcaster.on(`trip:${tripId}`, handler)
    request.on('close', () => broadcaster.off(`trip:${tripId}`, handler))
  }),
)