import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexOnPatientIdInMedicalReportsTable1758200595994
  implements MigrationInterface
{
  name = 'AddIndexOnPatientIdInMedicalReportsTable1758200595994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_41dff102aefb3ccee704e5b214" ON "Medical-Reports" ("patientId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_41dff102aefb3ccee704e5b214"`,
    );
  }
}
