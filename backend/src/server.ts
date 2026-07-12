import { app } from './app.js'
import { env } from './config/env.js'
import { startTelemetryFlushWorker } from './routes/telemetry.js'

app.listen(env.PORT, () => {
  startTelemetryFlushWorker()
  console.log(`AxisFleet backend listening on http://localhost:${env.PORT}`)
})