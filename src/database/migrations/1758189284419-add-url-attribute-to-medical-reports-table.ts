import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUrlAttributeToMedicalReportsTable1758189284419
  implements MigrationInterface
{
  name = 'AddUrlAttributeToMedicalReportsTable1758189284419';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Medical-Reports" ADD "url" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Medical-Reports" DROP COLUMN "url"`);
  }
}
