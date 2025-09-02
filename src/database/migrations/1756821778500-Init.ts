import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1756821778500 implements MigrationInterface {
  name = 'Init1756821778500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otps" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "used" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vital_sign_types_type_enum" AS ENUM('SYSTOLIC_PRESSURE', 'DIASTOLIC_PRESSURE', 'BLOOD_GLUCOSE', 'HEIGHT', 'WEIGHT', 'HEART_RATE', 'AGE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vital_sign_types" ("id" SERIAL NOT NULL, "globalId" character varying NOT NULL, "type" "public"."vital_sign_types_type_enum" NOT NULL, "minValue" double precision NOT NULL, "maxValue" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "vitalSignId" integer, CONSTRAINT "UQ_f02ecbf0fc59ad31eb90e0009ce" UNIQUE ("globalId"), CONSTRAINT "PK_24def17ec783ef902d24296e828" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "vital_signs" ("id" SERIAL NOT NULL, "globalId" character varying NOT NULL, "value" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, CONSTRAINT "UQ_375a939ecf602dddc34dc9b0131" UNIQUE ("globalId"), CONSTRAINT "PK_83ba5a3455279f645885c327bb6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "patients" ("id" SERIAL NOT NULL, "globalId" character varying NOT NULL, "dateOfBirth" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_d475818eab3507921f98c5d6cf8" UNIQUE ("globalId"), CONSTRAINT "REL_2c24c3490a26d04b0d70f92057" UNIQUE ("userId"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'PATIENT', 'DOCTOR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_language_enum" AS ENUM('ENGLISH', 'ARABIC')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "globalId" character varying NOT NULL, "email" character varying NOT NULL, "mobileNumber" integer NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "language" "public"."users_language_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1775913448b9f7736496b89388c" UNIQUE ("globalId"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_61dc14c8c49c187f5d08047c985" UNIQUE ("mobileNumber"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" ADD CONSTRAINT "FK_82b0deb105275568cdcef2823eb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vital_sign_types" ADD CONSTRAINT "FK_f9719eb48eac6d04a44cd534fe4" FOREIGN KEY ("vitalSignId") REFERENCES "vital_signs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vital_signs" ADD CONSTRAINT "FK_0bf1a9521caa83226b350608882" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vital_signs" DROP CONSTRAINT "FK_0bf1a9521caa83226b350608882"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vital_sign_types" DROP CONSTRAINT "FK_f9719eb48eac6d04a44cd534fe4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" DROP CONSTRAINT "FK_82b0deb105275568cdcef2823eb"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_language_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(`DROP TABLE "vital_signs"`);
    await queryRunner.query(`DROP TABLE "vital_sign_types"`);
    await queryRunner.query(`DROP TYPE "public"."vital_sign_types_type_enum"`);
    await queryRunner.query(`DROP TABLE "otps"`);
  }
}
