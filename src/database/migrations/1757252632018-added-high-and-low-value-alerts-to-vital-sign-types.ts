import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedHighAndLowValueAlertsToVitalSignTypes1757252632018
  implements MigrationInterface
{
  name = 'AddedHighAndLowValueAlertsToVitalSignTypes1757252632018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP COLUMN "minValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP COLUMN "maxValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD "minValidValue" double precision NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD "maxValidValue" double precision NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD "highValueAlert" double precision NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD "lowValueAlert" double precision NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP COLUMN "lowValueAlert"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP COLUMN "highValueAlert"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP COLUMN "maxValidValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP COLUMN "minValidValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD "maxValue" double precision NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD "minValue" double precision NOT NULL`,
    );
  }
}
