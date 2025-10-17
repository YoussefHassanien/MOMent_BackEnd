import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllergiesTable1760680645428 implements MigrationInterface {
  name = 'CreateAllergiesTable1760680645428';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."Allergies_type_enum" AS ENUM('Food', 'Drug')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Allergies" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."Allergies_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer NOT NULL, CONSTRAINT "UQ_954491159c44a88f87043150049" UNIQUE ("globalId"), CONSTRAINT "PK_f828c03d97287ce16fb394f9475" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_63eec6fb715cd03a282e6bbc3f" ON "Allergies" ("patientId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "Allergies" ADD CONSTRAINT "FK_63eec6fb715cd03a282e6bbc3f0" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Allergies" DROP CONSTRAINT "FK_63eec6fb715cd03a282e6bbc3f0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_63eec6fb715cd03a282e6bbc3f"`,
    );
    await queryRunner.query(`DROP TABLE "Allergies"`);
    await queryRunner.query(`DROP TYPE "public"."Allergies_type_enum"`);
  }
}
