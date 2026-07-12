CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "driver_status" AS ENUM('AVAILABLE', 'ON_TRIP', 'OFFLINE');--> statement-breakpoint
CREATE TYPE "expense_type" AS ENUM('FUEL', 'TOLL', 'FOOD', 'REPAIR', 'OTHER');--> statement-breakpoint
CREATE TYPE "payment_type" AS ENUM('To Pay', 'Paid', 'TBB (To Be Billed)');--> statement-breakpoint
CREATE TYPE "trip_status" AS ENUM('PLANNING', 'ASSIGNED', 'STARTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('ADMIN', 'MANAGER', 'DRIVER', 'CLIENT');--> statement-breakpoint
CREATE TYPE "vehicle_status" AS ENUM('AVAILABLE', 'ON_TRIP', 'MAINTENANCE');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid UNIQUE,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"license_number" varchar(100) NOT NULL UNIQUE,
	"status" "driver_status" DEFAULT 'AVAILABLE'::"driver_status" NOT NULL,
	"rating" numeric(2,1) DEFAULT '5.0' NOT NULL,
	"assigned_vehicle_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"trip_id" uuid NOT NULL,
	"type" "expense_type" NOT NULL,
	"amount" numeric(10,2) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"attachment_url" text,
	"approval_status" "approval_status" DEFAULT 'PENDING'::"approval_status" NOT NULL,
	"approved_by_user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "lorry_receipts" (
	"id" varchar(100) PRIMARY KEY,
	"lr_date" timestamp DEFAULT now() NOT NULL,
	"vehicle_no" varchar(50) NOT NULL,
	"driver_name" varchar(255) NOT NULL,
	"driver_phone" varchar(50) NOT NULL,
	"consignor_name" varchar(255) NOT NULL,
	"consignor_gstin" varchar(50) NOT NULL,
	"consignor_address" text NOT NULL,
	"consignee_name" varchar(255) NOT NULL,
	"consignee_gstin" varchar(50) NOT NULL,
	"consignee_address" text NOT NULL,
	"goods_description" text NOT NULL,
	"packaging_type" varchar(100) NOT NULL,
	"actual_weight" double precision NOT NULL,
	"charged_weight" double precision NOT NULL,
	"freight_amount" numeric(12,2) NOT NULL,
	"hamali_charges" numeric(10,2) DEFAULT '0',
	"demurrage_charges" numeric(10,2) DEFAULT '0',
	"other_charges" numeric(10,2) DEFAULT '0',
	"payment_type" "payment_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"jti" varchar(128) NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telemetry_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"trip_id" uuid NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"heading" double precision,
	"speed" double precision,
	"captured_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(50) DEFAULT 'driver-app' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"source" varchar(255) NOT NULL,
	"destination" varchar(255) NOT NULL,
	"client" varchar(255) NOT NULL,
	"driver_id" uuid,
	"vehicle_id" uuid,
	"status" "trip_status" DEFAULT 'PLANNING'::"trip_status" NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"distance_km" double precision,
	"revenue" numeric(12,2) NOT NULL,
	"fuel_budget" numeric(10,2) DEFAULT '0',
	"toll_budget" numeric(10,2) DEFAULT '0',
	"other_budget" numeric(10,2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"number_plate" varchar(50) NOT NULL UNIQUE,
	"type" varchar(100) NOT NULL,
	"capacity" varchar(50) NOT NULL,
	"status" "vehicle_status" DEFAULT 'AVAILABLE'::"vehicle_status" NOT NULL,
	"insurance_expiry" timestamp NOT NULL,
	"next_service_due_date" timestamp,
	"assigned_driver_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS "users" CASCADE;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'DRIVER'::"user_role" NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_assigned_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("assigned_vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_user_id_users_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "telemetry_points" ADD CONSTRAINT "telemetry_points_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL;