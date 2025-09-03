import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedDefaultFalseValueForOtbUsedAttribute1756902307478
  implements MigrationInterface
{
  name = 'AddedDefaultFalseValueForOtbUsedAttribute1756902307478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otps" ALTER COLUMN "used" SET DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otps" ALTER COLUMN "used" DROP DEFAULT`,
    );
  }
}
