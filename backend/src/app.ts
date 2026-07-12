import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { authRouter } from './routes/auth.js'
import { fleetRouter } from './routes/fleet.js'
import { receiptsRouter } from './routes/receipts.js'
import { telemetryRouter } from './routes/telemetry.js'
import { tripsRouter } from './routes/trips.js'
import { env } from './config/env.js'
import { notFoundHandler, errorHandler } from './lib/http.js'
import { applySecurityHeaders, corsMiddleware, requestRateLimiter } from './middleware/security.js'
import { openApiDocument } from './docs/openapi.js'

export const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))
app.use(applySecurityHeaders)
app.use(corsMiddleware)
app.use(requestRateLimiter({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX }))

app.get('/api-docs.json', (_request, response) => {
  response.json(openApiDocument)
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: true }))

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'axisfleet-backend' })
})

app.get('/', (_request, response) => {
  response.json({ message: 'AxisFleet backend is running' })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1', fleetRouter)
app.use('/api/v1/trips', tripsRouter)
app.use('/api/v1/receipts', receiptsRouter)
app.use('/api/v1', telemetryRouter)

app.use(notFoundHandler)
app.use(errorHandler)