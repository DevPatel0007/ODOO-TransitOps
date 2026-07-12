import { boolean, doublePrecision, integer, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'MANAGER', 'DRIVER', 'CLIENT'])
export const vehicleStatusEnum = pgEnum('vehicle_status', ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE'])
export const driverStatusEnum = pgEnum('driver_status', ['AVAILABLE', 'ON_TRIP', 'OFFLINE'])
export const tripStatusEnum = pgEnum('trip_status', ['PLANNING', 'ASSIGNED', 'STARTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'])
export const paymentTypeEnum = pgEnum('payment_type', ['To Pay', 'Paid', 'TBB (To Be Billed)'])
export const expenseTypeEnum = pgEnum('expense_type', ['FUEL', 'TOLL', 'FOOD', 'REPAIR', 'OTHER'])
export const approvalStatusEnum = pgEnum('approval_status', ['PENDING', 'APPROVED', 'REJECTED'])

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('DRIVER').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const vehiclesTable = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  numberPlate: varchar('number_plate', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 100 }).notNull(),
  capacity: varchar('capacity', { length: 50 }).notNull(),
  status: vehicleStatusEnum('status').default('AVAILABLE').notNull(),
  insuranceExpiry: timestamp('insurance_expiry').notNull(),
  nextServiceDueDate: timestamp('next_service_due_date'),
  assignedDriverId: uuid('assigned_driver_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const driversTable = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'set null' }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  licenseNumber: varchar('license_number', { length: 100 }).notNull().unique(),
  status: driverStatusEnum('status').default('AVAILABLE').notNull(),
  rating: numeric('rating', { precision: 2, scale: 1 }).default('5.0').notNull(),
  assignedVehicleId: uuid('assigned_vehicle_id').references(() => vehiclesTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const refreshSessionsTable = pgTable('refresh_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  jti: varchar('jti', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const lorryReceiptsTable = pgTable('lorry_receipts', {
  id: varchar('id', { length: 100 }).primaryKey(),
  lrDate: timestamp('lr_date').defaultNow().notNull(),
  vehicleNo: varchar('vehicle_no', { length: 50 }).notNull(),
  driverName: varchar('driver_name', { length: 255 }).notNull(),
  driverPhone: varchar('driver_phone', { length: 50 }).notNull(),
  consignorName: varchar('consignor_name', { length: 255 }).notNull(),
  consignorGstin: varchar('consignor_gstin', { length: 50 }).notNull(),
  consignorAddress: text('consignor_address').notNull(),
  consigneeName: varchar('consignee_name', { length: 255 }).notNull(),
  consigneeGstin: varchar('consignee_gstin', { length: 50 }).notNull(),
  consigneeAddress: text('consignee_address').notNull(),
  goodsDescription: text('goods_description').notNull(),
  packagingType: varchar('packaging_type', { length: 100 }).notNull(),
  actualWeight: doublePrecision('actual_weight').notNull(),
  chargedWeight: doublePrecision('charged_weight').notNull(),
  freightAmount: numeric('freight_amount', { precision: 12, scale: 2 }).notNull(),
  hamaliCharges: numeric('hamali_charges', { precision: 10, scale: 2 }).default('0'),
  demurrageCharges: numeric('demurrage_charges', { precision: 10, scale: 2 }).default('0'),
  otherCharges: numeric('other_charges', { precision: 10, scale: 2 }).default('0'),
  paymentType: paymentTypeEnum('payment_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tripsTable = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: varchar('source', { length: 255 }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  client: varchar('client', { length: 255 }).notNull(),
  driverId: uuid('driver_id').references(() => driversTable.id, { onDelete: 'set null' }),
  vehicleId: uuid('vehicle_id').references(() => vehiclesTable.id, { onDelete: 'set null' }),
  status: tripStatusEnum('status').default('PLANNING').notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  distanceKm: doublePrecision('distance_km'),
  revenue: numeric('revenue', { precision: 12, scale: 2 }).notNull(),
  fuelBudget: numeric('fuel_budget', { precision: 10, scale: 2 }).default('0'),
  tollBudget: numeric('toll_budget', { precision: 10, scale: 2 }).default('0'),
  otherBudget: numeric('other_budget', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const expensesTable = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => tripsTable.id, { onDelete: 'cascade' }).notNull(),
  type: expenseTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  description: text('description').notNull(),
  attachmentUrl: text('attachment_url'),
  approvalStatus: approvalStatusEnum('approval_status').default('PENDING').notNull(),
  approvedByUserId: uuid('approved_by_user_id').references(() => usersTable.id, { onDelete: 'set null' }),
})

export const telemetryPointsTable = pgTable('telemetry_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => tripsTable.id, { onDelete: 'cascade' }).notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  heading: doublePrecision('heading'),
  speed: doublePrecision('speed'),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
  source: varchar('source', { length: 50 }).default('driver-app').notNull(),
})
