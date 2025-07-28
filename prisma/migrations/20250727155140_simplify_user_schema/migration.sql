/*
  Warnings:

  - You are about to drop the column `otp` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `otp_expiry` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "otp",
DROP COLUMN "otp_expiry",
ADD COLUMN     "provider" VARCHAR(50) DEFAULT 'email',
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "is_verified" SET DEFAULT true,
ALTER COLUMN "role" SET DEFAULT 'admin';
