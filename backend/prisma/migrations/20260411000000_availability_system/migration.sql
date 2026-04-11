-- Rename existing columns (safe — no data loss)
ALTER TABLE "bookings" RENAME COLUMN "userName" TO "guest_name";
ALTER TABLE "bookings" RENAME COLUMN "userEmail" TO "guest_email";
ALTER TABLE "bookings" RENAME COLUMN "totalPrice" TO "amount_paid";

-- Add phone number column (required field, default empty string for existing rows)
ALTER TABLE "bookings" ADD COLUMN "guest_phone" TEXT NOT NULL DEFAULT '';

-- Make guest_email nullable (it was required before, now optional)
ALTER TABLE "bookings" ALTER COLUMN "guest_email" DROP NOT NULL;

-- Drop old index on userEmail, create new one on guest_phone
DROP INDEX IF EXISTS "bookings_userEmail_idx";
CREATE INDEX "bookings_guest_phone_idx" ON "bookings"("guest_phone");

-- Create admins table
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- Unique index on admin username
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
