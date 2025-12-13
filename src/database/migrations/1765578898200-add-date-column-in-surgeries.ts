import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDateColumnInSurgeries1765578898200
  implements MigrationInterface
{
  name = 'AddDateColumnInSurgeries1765578898200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Surgeries" ADD "date" date NOT NULL DEFAULT '2000-01-01'`,
    );
    await queryRunner.query(
      `ALTER TABLE "Surgeries" ALTER COLUMN "date" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" ADD "category" "public"."DrugInteractions_category_enum" NOT NULL DEFAULT 'A'`,
    );
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" ALTER COLUMN "category" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "Surgeries" ADD CONSTRAINT "FK_e6d8b5d616eacb862a76293c344" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Surgeries" DROP CONSTRAINT "FK_e6d8b5d616eacb862a76293c344"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" DROP COLUMN "category"`,
    );
    await queryRunner.query(`ALTER TABLE "Surgeries" DROP COLUMN "date"`);
  }
}
