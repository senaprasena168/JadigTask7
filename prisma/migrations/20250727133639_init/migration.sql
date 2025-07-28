-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_verified" BOOLEAN DEFAULT false,
    "otp" VARCHAR(6),
    "otp_expiry" TIMESTAMP(6),
    "role" VARCHAR(50) DEFAULT 'user',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(500),
    "image_key" VARCHAR(500),
    "image_type" VARCHAR(50),
    "image" VARCHAR(500),
    "image_data" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");
