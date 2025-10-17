import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUrlInMedicalReportsTable1758232774749
  implements MigrationInterface
{
  name = 'AddUrlInMedicalReportsTable1758232774749';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Medical-Reports" ADD "url" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Medical-Reports" DROP COLUMN "url"`);
  }
}
