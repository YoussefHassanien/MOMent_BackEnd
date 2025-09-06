import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAllModels1757090109853 implements MigrationInterface {
  name = 'UpdateAllModels1757090109853';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "OTPs" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "used" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "UQ_5b86eb3af0f423a49f80758847b" UNIQUE ("userId"), CONSTRAINT "REL_5b86eb3af0f423a49f80758847" UNIQUE ("userId"), CONSTRAINT "PK_4105789cf21ab0b26e505402e0a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Vital-Sign-Types_type_enum" AS ENUM('SYSTOLIC_PRESSURE', 'DIASTOLIC_PRESSURE', 'BLOOD_GLUCOSE', 'HEIGHT', 'WEIGHT', 'HEART_RATE', 'AGE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Vital-Sign-Types" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."Vital-Sign-Types_type_enum" NOT NULL, "minValue" double precision NOT NULL, "maxValue" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "vitalSignId" integer, CONSTRAINT "UQ_c57324faea13ddcc0753fadf89a" UNIQUE ("globalId"), CONSTRAINT "PK_c69040b07d3976fd334c9ef8dc0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Vital-Signs" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, CONSTRAINT "UQ_b85c4bcd3dad8438ae60055f763" UNIQUE ("globalId"), CONSTRAINT "PK_4cd97b1117db81962ef39468513" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Patients" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateOfBirth" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "UQ_993c75014a173701e1c5a03b9d5" UNIQUE ("globalId"), CONSTRAINT "UQ_7a6a5ab44fe595679b9bdd6e9e8" UNIQUE ("userId"), CONSTRAINT "REL_7a6a5ab44fe595679b9bdd6e9e" UNIQUE ("userId"), CONSTRAINT "PK_9cb4d71eb7ec74c115f3b619841" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Refresh-Tokens" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_174c6291d315de0c94916146f20" UNIQUE ("userId"), CONSTRAINT "REL_174c6291d315de0c94916146f2" UNIQUE ("userId"), CONSTRAINT "PK_7c3f2cb9a7e7e014a2a5788f0ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Users_role_enum" AS ENUM('ADMIN', 'PATIENT', 'DOCTOR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Users_language_enum" AS ENUM('ENGLISH', 'ARABIC')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Users" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "mobileNumber" character varying NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."Users_role_enum" NOT NULL, "language" "public"."Users_language_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4985e23c97e3c7f942d4f725c99" UNIQUE ("globalId"), CONSTRAINT "UQ_3c3ab3f49a87e6ddb607f3c4945" UNIQUE ("email"), CONSTRAINT "UQ_953de8baee7f84f0b9eb3ffd58a" UNIQUE ("mobileNumber"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "OTPs" ADD CONSTRAINT "FK_5b86eb3af0f423a49f80758847b" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" ADD CONSTRAINT "FK_79cf72f96227c88413bb752696e" FOREIGN KEY ("vitalSignId") REFERENCES "Vital-Signs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" ADD CONSTRAINT "FK_d56252d6487c51602a229816d41" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patients" ADD CONSTRAINT "FK_7a6a5ab44fe595679b9bdd6e9e8" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Refresh-Tokens" ADD CONSTRAINT "FK_174c6291d315de0c94916146f20" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Refresh-Tokens" DROP CONSTRAINT "FK_174c6291d315de0c94916146f20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Patients" DROP CONSTRAINT "FK_7a6a5ab44fe595679b9bdd6e9e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Signs" DROP CONSTRAINT "FK_d56252d6487c51602a229816d41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Vital-Sign-Types" DROP CONSTRAINT "FK_79cf72f96227c88413bb752696e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "OTPs" DROP CONSTRAINT "FK_5b86eb3af0f423a49f80758847b"`,
    );
    await queryRunner.query(`DROP TABLE "Users"`);
    await queryRunner.query(`DROP TYPE "public"."Users_language_enum"`);
    await queryRunner.query(`DROP TYPE "public"."Users_role_enum"`);
    await queryRunner.query(`DROP TABLE "Refresh-Tokens"`);
    await queryRunner.query(`DROP TABLE "Patients"`);
    await queryRunner.query(`DROP TABLE "Vital-Signs"`);
    await queryRunner.query(`DROP TABLE "Vital-Sign-Types"`);
    await queryRunner.query(`DROP TYPE "public"."Vital-Sign-Types_type_enum"`);
    await queryRunner.query(`DROP TABLE "OTPs"`);
  }
}
