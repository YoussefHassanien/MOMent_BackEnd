import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastSentAtToPatientMedicines1763000000003 implements MigrationInterface {
  name = 'AddLastSentAtToPatientMedicines1763000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PatientMedicines" ADD COLUMN "lastSentAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PatientMedicines" DROP COLUMN "lastSentAt"`);
  }
}
