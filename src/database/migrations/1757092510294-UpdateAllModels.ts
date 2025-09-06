import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAllModels1757092510294 implements MigrationInterface {
  name = 'UpdateAllModels1757092510294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP CONSTRAINT "FK_79cf72f96227c88413bb752696e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP COLUMN "vitalSignId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" ADD "typeId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" DROP CONSTRAINT "FK_d56252d6487c51602a229816d41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" ALTER COLUMN "patientId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" ADD CONSTRAINT "FK_753e12e5f92983b539dedd34e18" FOREIGN KEY ("typeId") REFERENCES "Vital-Sign-Types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" ADD CONSTRAINT "FK_d56252d6487c51602a229816d41" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" DROP CONSTRAINT "FK_d56252d6487c51602a229816d41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" DROP CONSTRAINT "FK_753e12e5f92983b539dedd34e18"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" ALTER COLUMN "patientId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" ADD CONSTRAINT "FK_d56252d6487c51602a229816d41" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "Vital-Signs" DROP COLUMN "typeId"`);
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD "vitalSignId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD CONSTRAINT "FK_79cf72f96227c88413bb752696e" FOREIGN KEY ("vitalSignId") REFERENCES "Vital-Signs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
