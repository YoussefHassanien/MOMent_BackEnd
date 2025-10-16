import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSurgeriesTable1759000000000 implements MigrationInterface {
  name = 'AddSurgeriesTable1759000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Surgeries" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer NOT NULL, CONSTRAINT "UQ_7b8f6f9d6f4d5c9b2e6c1f0a9b" UNIQUE ("globalId"), CONSTRAINT "PK_5d4a9c6b7f8e9d0c1b2a3e4f5g" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Surgeries" ADD CONSTRAINT "FK_surveys_patient" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Surgeries" DROP CONSTRAINT "FK_surveys_patient"`,
    );
    await queryRunner.query(`DROP TABLE "Surgeries"`);
  }
}
