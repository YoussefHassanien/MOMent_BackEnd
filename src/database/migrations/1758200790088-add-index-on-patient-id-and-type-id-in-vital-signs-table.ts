import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexOnPatientIdAndTypeIdInVitalSignsTable1758200790088
  implements MigrationInterface
{
  name = 'AddIndexOnPatientIdAndTypeIdInVitalSignsTable1758200790088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_753e12e5f92983b539dedd34e1" ON "Vital-Signs" ("typeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d56252d6487c51602a229816d4" ON "Vital-Signs" ("patientId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d56252d6487c51602a229816d4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_753e12e5f92983b539dedd34e1"`,
    );
  }
}
