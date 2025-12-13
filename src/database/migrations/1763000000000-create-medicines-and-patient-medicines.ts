import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicinesAndPatientMedicines1763000000000 implements MigrationInterface {
  name = 'CreateMedicinesAndPatientMedicines1763000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Medicines" (
        "id" SERIAL NOT NULL,
        "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "use" character varying,
        "category" character varying,
        "pregnancyFirst" character varying,
        "pregnancySecond" character varying,
        "pregnancyThird" character varying,
        "breastfeeding" character varying,
        "contraindications" text,
        "useWithCaution" text,
        "contactYourPhysician" text,
        "interactions" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_medicines" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_medicines_name" ON "Medicines" ("name")`);

    await queryRunner.query(`
      CREATE TABLE "PatientMedicines" (
        "id" SERIAL NOT NULL,
        "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" integer NOT NULL,
        "medicineId" integer NOT NULL,
        "dosage" character varying,
        "scheduleTimes" character varying,
        "duration" character varying,
        "safetyLabel" character varying NOT NULL DEFAULT 'CAUTION',
        "contraindicatedByAllergy" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_medicines" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_patient_medicines_patient" ON "PatientMedicines" ("patientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_patient_medicines_medicine" ON "PatientMedicines" ("medicineId")`);

    // Note: CSV contains complex multi-line fields; seeding is intentionally omitted here.
    // If you want to seed from `medication tracker.csv`, create a separate script or migration with a robust CSV parser.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_patient_medicines_medicine"`);
    await queryRunner.query(`DROP INDEX "IDX_patient_medicines_patient"`);
    await queryRunner.query(`DROP TABLE "PatientMedicines"`);
    await queryRunner.query(`DROP INDEX "IDX_medicines_name"`);
    await queryRunner.query(`DROP TABLE "Medicines"`);
  }
}
