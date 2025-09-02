-- CreateEnum
CREATE TYPE "public"."VitalSignsTypes" AS ENUM ('SYSTOLIC_PRESSURE', 'DIASTOLIC_PRESSURE', 'BLOOD_GLUCOSE', 'HEIGHT', 'WEIGHT', 'HEART_RATE', 'AGE');

-- CreateTable
CREATE TABLE "public"."OTPs" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "OTPs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patients" (
    "id" SERIAL NOT NULL,
    "globalId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vital_Signs_Types" (
    "id" SERIAL NOT NULL,
    "globalId" TEXT NOT NULL,
    "type" "public"."VitalSignsTypes" NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "vitalSignId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vital_Signs_Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vital_Signs" (
    "id" SERIAL NOT NULL,
    "globalId" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vital_Signs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patients_globalId_key" ON "public"."Patients"("globalId");

-- CreateIndex
CREATE UNIQUE INDEX "Patients_userId_key" ON "public"."Patients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vital_Signs_Types_globalId_key" ON "public"."Vital_Signs_Types"("globalId");

-- CreateIndex
CREATE UNIQUE INDEX "Vital_Signs_globalId_key" ON "public"."Vital_Signs"("globalId");

-- AddForeignKey
ALTER TABLE "public"."OTPs" ADD CONSTRAINT "OTPs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Patients" ADD CONSTRAINT "Patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vital_Signs_Types" ADD CONSTRAINT "Vital_Signs_Types_vitalSignId_fkey" FOREIGN KEY ("vitalSignId") REFERENCES "public"."Vital_Signs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vital_Signs" ADD CONSTRAINT "Vital_Signs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
