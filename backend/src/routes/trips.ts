import { randomUUID } from 'node:crypto'
import express, { type Request, type Response } from 'express'
import { eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { driversTable, tripsTable, vehiclesTable } from '../db/schema.js'
import { authenticateRequest, authorizeRoles } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../lib/http.js'

export const tripsRouter = express.Router()

tripsRouter.use(authenticateRequest)

tripsRouter.post(
  '/',
  authorizeRoles('ADMIN', 'MANAGER'),
  asyncHandler(async (request: Request, response: Response) => {
    const { source, destination, client, revenue, driverId, vehicleId } = request.body as Record<string, string | undefined>
    if (!source || !destination || !client || !revenue) throw new ApiError('Missing required trip fields', 400)

    const [trip] = await db
      .insert(tripsTable)
      .values({
        id: randomUUID(),
        source,
        destination,
        client,
        revenue,
        driverId: driverId ?? null,
        vehicleId: vehicleId ?? null,
        status: driverId && vehicleId ? 'ASSIGNED' : 'PLANNING',
      })
      .returning()

    if (driverId) await db.update(driversTable).set({ status: 'ON_TRIP' }).where(eq(driversTable.id, driverId))
    if (vehicleId) await db.update(vehiclesTable).set({ status: 'ON_TRIP' }).where(eq(vehiclesTable.id, vehicleId))

    response.status(201).json({ trip })
  }),
)

tripsRouter.patch(
  '/:id/status',
  authorizeRoles('ADMIN', 'MANAGER'),
  asyncHandler(async (request: Request, response: Response) => {
    const tripId = String(request.params.id)
    const { status } = request.body as { status?: 'PLANNING' | 'ASSIGNED' | 'STARTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' }
    if (!status) throw new ApiError('status is required', 400)

    const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, tripId)).limit(1)
    if (!trip) throw new ApiError('Trip not found', 404)

    await db.update(tripsTable).set({ status, endTime: status === 'DELIVERED' || status === 'CANCELLED' ? new Date() : trip.endTime }).where(eq(tripsTable.id, tripId))

    if (status === 'DELIVERED' || status === 'CANCELLED') {
      if (trip.driverId) await db.update(driversTable).set({ status: 'AVAILABLE' }).where(eq(driversTable.id, trip.driverId))
      if (trip.vehicleId) await db.update(vehiclesTable).set({ status: 'AVAILABLE' }).where(eq(vehiclesTable.id, trip.vehicleId))
    }

    response.json({ message: 'Trip status updated' })
  }),
)

tripsRouter.get(
  '/',
  asyncHandler(async (_request: Request, response: Response) => {
    const trips = await db.select().from(tripsTable)
    response.json({ trips })
  }),
)