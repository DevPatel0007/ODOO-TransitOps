import { randomUUID } from 'node:crypto'
import express, { type Request, type Response } from 'express'
import { eq } from 'drizzle-orm'

import { db } from '../db/index.js'
import { driversTable, vehiclesTable } from '../db/schema.js'
import { authenticateRequest, authorizeRoles } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../lib/http.js'

export const fleetRouter = express.Router()

fleetRouter.use(authenticateRequest)

fleetRouter.get(
  '/vehicles',
  asyncHandler(async (request: Request, response: Response) => {
    const status = request.query.status?.toString()
    const search = request.query.search?.toString()

    const rows = await db.select().from(vehiclesTable)
    const filtered = rows.filter((vehicle) => {
      const statusMatch = !status || vehicle.status === status
      const searchMatch = !search || vehicle.numberPlate.toLowerCase().includes(search.toLowerCase()) || vehicle.type.toLowerCase().includes(search.toLowerCase())
      return statusMatch && searchMatch
    })

    response.json({ vehicles: filtered })
  }),
)

fleetRouter.post(
  '/vehicles',
  authorizeRoles('ADMIN', 'MANAGER'),
  asyncHandler(async (request: Request, response: Response) => {
    const { numberPlate, type, capacity, insuranceExpiry, nextServiceDueDate } = request.body as Record<string, string | undefined>
    if (!numberPlate || !type || !capacity || !insuranceExpiry) throw new ApiError('Missing required vehicle fields', 400)

    const [vehicle] = await db
      .insert(vehiclesTable)
      .values({
        id: randomUUID(),
        numberPlate,
        type,
        capacity,
        insuranceExpiry: new Date(insuranceExpiry),
        nextServiceDueDate: nextServiceDueDate ? new Date(nextServiceDueDate) : null,
      })
      .returning()

    response.status(201).json({ vehicle })
  }),
)

fleetRouter.patch(
  '/vehicles/:id/assign-driver',
  authorizeRoles('ADMIN', 'MANAGER'),
  asyncHandler(async (request: Request, response: Response) => {
    const vehicleId = String(request.params.id)
    const { driverId } = request.body as { driverId?: string }
    if (!driverId) throw new ApiError('driverId is required', 400)

    const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, vehicleId)).limit(1)
    const [driver] = await db.select().from(driversTable).where(eq(driversTable.id, driverId)).limit(1)

    if (!vehicle || !driver) throw new ApiError('Vehicle or driver not found', 404)

    await db.update(vehiclesTable).set({ assignedDriverId: driver.id }).where(eq(vehiclesTable.id, vehicleId))
    await db.update(driversTable).set({ assignedVehicleId: vehicle.id }).where(eq(driversTable.id, driverId))

    response.json({ message: 'Driver assigned', vehicleId, driverId })
  }),
)

fleetRouter.get(
  '/drivers/available',
  asyncHandler(async (_request: Request, response: Response) => {
    const rows = await db.select().from(driversTable)
    response.json({ drivers: rows.filter((driver) => driver.status === 'AVAILABLE') })
  }),
)

fleetRouter.get(
  '/drivers',
  asyncHandler(async (_request: Request, response: Response) => {
    const rows = await db.select().from(driversTable)
    response.json({ drivers: rows })
  }),
)