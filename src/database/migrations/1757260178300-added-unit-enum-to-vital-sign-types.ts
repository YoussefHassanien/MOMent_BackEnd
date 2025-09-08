import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedUnitEnumToVitalSignTypes1757260178300
  implements MigrationInterface
{
  name = 'AddedUnitEnumToVitalSignTypes1757260178300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."Vital-Sign-Types_unit_enum" AS ENUM('mmHg', 'mg/dL', 'cm', 'kg', 'bpm', 'years')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD "unit" "public"."Vital-Sign-Types_unit_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP COLUMN "unit"`,
    );
    await queryRunner.query(`DROP TYPE "public"."Vital-Sign-Types_unit_enum"`);
  }
}
