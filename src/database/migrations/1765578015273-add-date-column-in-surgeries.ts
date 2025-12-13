import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDateColumnInSurgeries1765578015273
  implements MigrationInterface
{
  name = 'AddDateColumnInSurgeries1765578015273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_medicines_name"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_patient_medicines_medicine"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_patient_medicines_patient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Medicines" ADD CONSTRAINT "UQ_16e16f73bb4f2071cd06f482130" UNIQUE ("globalId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Medicines" ADD CONSTRAINT "UQ_7dce172fde364eec4f6205efd3b" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" ADD CONSTRAINT "UQ_4e2fa0bc62255f6870d661bdeef" UNIQUE ("globalId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" DROP COLUMN "safetyLabel"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."PatientMedicines_safetylabel_enum" AS ENUM('SAFE', 'CAUTION', 'DANGER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" ADD "safetyLabel" "public"."PatientMedicines_safetylabel_enum" NOT NULL DEFAULT 'CAUTION'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7dce172fde364eec4f6205efd3" ON "Medicines" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b6c2cdc78dd3d8de64cf977ab9" ON "PatientMedicines" ("patientId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f5fc16d00d3bbbd7f110f8191" ON "PatientMedicines" ("medicineId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" ADD CONSTRAINT "FK_b6c2cdc78dd3d8de64cf977ab96" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" ADD CONSTRAINT "FK_8f5fc16d00d3bbbd7f110f81917" FOREIGN KEY ("medicineId") REFERENCES "Medicines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" DROP CONSTRAINT "FK_8f5fc16d00d3bbbd7f110f81917"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" DROP CONSTRAINT "FK_b6c2cdc78dd3d8de64cf977ab96"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f5fc16d00d3bbbd7f110f8191"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b6c2cdc78dd3d8de64cf977ab9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7dce172fde364eec4f6205efd3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" DROP COLUMN "safetyLabel"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."PatientMedicines_safetylabel_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" ADD "safetyLabel" character varying NOT NULL DEFAULT 'CAUTION'`,
    );
    await queryRunner.query(
      `ALTER TABLE "PatientMedicines" DROP CONSTRAINT "UQ_4e2fa0bc62255f6870d661bdeef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Medicines" DROP CONSTRAINT "UQ_7dce172fde364eec4f6205efd3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Medicines" DROP CONSTRAINT "UQ_16e16f73bb4f2071cd06f482130"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_patient_medicines_patient" ON "PatientMedicines" ("patientId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_patient_medicines_medicine" ON "PatientMedicines" ("medicineId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_medicines_name" ON "Medicines" ("name") `,
    );
  }
}
