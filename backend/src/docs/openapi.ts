export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'AxisFleet Logistics API',
    version: '1.0.0',
    description: 'Production backend API for fleet, trips, receipts, telemetry, and authentication.',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service status' },
    { name: 'Auth', description: 'Authentication and session management' },
    { name: 'Fleet', description: 'Vehicles and drivers' },
    { name: 'Trips', description: 'Trip lifecycle management' },
    { name: 'Receipts', description: 'Lorry receipts and PDF output' },
    { name: 'Telemetry', description: 'Live GPS ingestion and tracking' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      AuthRegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Aman Sharma' },
          email: { type: 'string', format: 'email', example: 'aman@example.com' },
          password: { type: 'string', format: 'password', example: 'Passw0rd!' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'DRIVER', 'CLIENT'], example: 'DRIVER' },
        },
      },
      AuthLoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      VehicleCreateRequest: {
        type: 'object',
        required: ['numberPlate', 'type', 'capacity', 'insuranceExpiry'],
        properties: {
          numberPlate: { type: 'string', example: 'GJ01AB1234' },
          type: { type: 'string', example: 'Container Truck (32ft)' },
          capacity: { type: 'string', example: '25 Tons' },
          insuranceExpiry: { type: 'string', format: 'date-time' },
          nextServiceDueDate: { type: 'string', format: 'date-time' },
        },
      },
      TripCreateRequest: {
        type: 'object',
        required: ['source', 'destination', 'client', 'revenue'],
        properties: {
          source: { type: 'string', example: 'Ahmedabad' },
          destination: { type: 'string', example: 'Mumbai' },
          client: { type: 'string', example: 'Axis Textiles' },
          revenue: { type: 'string', example: '45000.00' },
          driverId: { type: 'string', format: 'uuid' },
          vehicleId: { type: 'string', format: 'uuid' },
        },
      },
      TripStatusUpdateRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['PLANNING', 'ASSIGNED', 'STARTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] },
        },
      },
      ReceiptCreateRequest: {
        type: 'object',
        required: ['consignorName', 'consigneeName', 'goodsDescription', 'freightAmount', 'paymentType'],
        properties: {
          vehicleNo: { type: 'string' },
          driverName: { type: 'string' },
          driverPhone: { type: 'string' },
          consignorName: { type: 'string' },
          consignorGstin: { type: 'string' },
          consignorAddress: { type: 'string' },
          consigneeName: { type: 'string' },
          consigneeGstin: { type: 'string' },
          consigneeAddress: { type: 'string' },
          goodsDescription: { type: 'string' },
          packagingType: { type: 'string' },
          actualWeight: { type: 'number' },
          chargedWeight: { type: 'number' },
          freightAmount: { type: 'number' },
          hamaliCharges: { type: 'number' },
          demurrageCharges: { type: 'number' },
          otherCharges: { type: 'number' },
          paymentType: { type: 'string', enum: ['To Pay', 'Paid', 'TBB (To Be Billed)'] },
        },
      },
      TelemetryPingRequest: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
          latitude: { type: 'number', example: 23.0225 },
          longitude: { type: 'number', example: 72.5714 },
          heading: { type: 'number', example: 180 },
          speed: { type: 'number', example: 55 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    service: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthRegisterRequest' } } },
        },
        responses: { 201: { description: 'User created' } },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT access token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLoginRequest' } } },
        },
        responses: { 200: { description: 'Authenticated' } },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and revoke refresh session',
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current user' } },
      },
    },
    '/api/v1/vehicles': {
      get: {
        tags: ['Fleet'],
        summary: 'List vehicles',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Vehicle list' } },
      },
      post: {
        tags: ['Fleet'],
        summary: 'Create vehicle',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VehicleCreateRequest' } } },
        },
        responses: { 201: { description: 'Vehicle created' } },
      },
    },
    '/api/v1/vehicles/{id}/assign-driver': {
      patch: {
        tags: ['Fleet'],
        summary: 'Assign a driver to a vehicle',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['driverId'],
                properties: { driverId: { type: 'string', format: 'uuid' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Driver assigned' } },
      },
    },
    '/api/v1/drivers': {
      get: {
        tags: ['Fleet'],
        summary: 'List drivers',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Driver list' } },
      },
    },
    '/api/v1/trips': {
      get: {
        tags: ['Trips'],
        summary: 'List trips',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Trip list' } },
      },
      post: {
        tags: ['Trips'],
        summary: 'Create trip',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TripCreateRequest' } } },
        },
        responses: { 201: { description: 'Trip created' } },
      },
    },
    '/api/v1/trips/{id}/status': {
      patch: {
        tags: ['Trips'],
        summary: 'Update trip status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TripStatusUpdateRequest' } } },
        },
        responses: { 200: { description: 'Trip updated' } },
      },
    },
    '/api/v1/receipts': {
      get: {
        tags: ['Receipts'],
        summary: 'List receipts',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Receipt list' } },
      },
      post: {
        tags: ['Receipts'],
        summary: 'Create receipt',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ReceiptCreateRequest' } } },
        },
        responses: { 201: { description: 'Receipt created' } },
      },
    },
    '/api/v1/receipts/{id}/pdf': {
      get: {
        tags: ['Receipts'],
        summary: 'Download receipt PDF',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'PDF stream' } },
      },
    },
    '/api/v1/trips/{tripId}/ping': {
      post: {
        tags: ['Telemetry'],
        summary: 'Buffer a telemetry ping',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'tripId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TelemetryPingRequest' } } },
        },
        responses: { 200: { description: 'Telemetry buffered' } },
      },
    },
    '/api/v1/trips/{tripId}/track': {
      get: {
        tags: ['Telemetry'],
        summary: 'Stream live trip tracking events',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'tripId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Server-sent events stream' } },
      },
    },
  },
} as const