import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedMissingVitalSignTypes1757628445696
  implements MigrationInterface
{
  name = 'AddedMissingVitalSignTypes1757628445696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."Vital-Sign-Types_type_enum" RENAME TO "Vital-Sign-Types_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Vital-Sign-Types_type_enum" AS ENUM('SYSTOLIC_PRESSURE', 'DIASTOLIC_PRESSURE', 'BLOOD_GLUCOSE_FASTING', 'BLOOD_GLUCOSE_POSTPRANDIAL', 'HEIGHT', 'WEIGHT', 'HEART_RATE', 'AGE', 'BODY_MASS_INDEX')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ALTER COLUMN "type" TYPE "public"."Vital-Sign-Types_type_enum" USING "type"::"text"::"public"."Vital-Sign-Types_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."Vital-Sign-Types_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."Vital-Sign-Types_unit_enum" RENAME TO "Vital-Sign-Types_unit_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Vital-Sign-Types_unit_enum" AS ENUM('mmHg', 'mg/dL', 'cm', 'kg', 'bpm', 'years', 'kg/(m*m)')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ALTER COLUMN "unit" TYPE "public"."Vital-Sign-Types_unit_enum" USING "unit"::"text"::"public"."Vital-Sign-Types_unit_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."Vital-Sign-Types_unit_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."Vital-Sign-Types_unit_enum_old" AS ENUM('mmHg', 'mg/dL', 'cm', 'kg', 'bpm', 'years')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ALTER COLUMN "unit" TYPE "public"."Vital-Sign-Types_unit_enum_old" USING "unit"::"text"::"public"."Vital-Sign-Types_unit_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."Vital-Sign-Types_unit_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."Vital-Sign-Types_unit_enum_old" RENAME TO "Vital-Sign-Types_unit_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Vital-Sign-Types_type_enum_old" AS ENUM('SYSTOLIC_PRESSURE', 'DIASTOLIC_PRESSURE', 'BLOOD_GLUCOSE', 'HEIGHT', 'WEIGHT', 'HEART_RATE', 'AGE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ALTER COLUMN "type" TYPE "public"."Vital-Sign-Types_type_enum_old" USING "type"::"text"::"public"."Vital-Sign-Types_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."Vital-Sign-Types_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."Vital-Sign-Types_type_enum_old" RENAME TO "Vital-Sign-Types_type_enum"`,
    );
  }
}
