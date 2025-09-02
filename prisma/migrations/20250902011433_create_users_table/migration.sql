-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'PATIENT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('ENGLISH', 'ARABIC');

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" SERIAL NOT NULL,
    "globalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "language" "public"."Language" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_globalId_key" ON "public"."Users"("globalId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_mobileNumber_key" ON "public"."Users"("mobileNumber");
