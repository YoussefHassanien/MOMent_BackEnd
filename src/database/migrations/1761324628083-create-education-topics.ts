import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEducationTopics1761324628083 implements MigrationInterface {
  name = 'CreateEducationTopics1761324628083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Surgeries" DROP CONSTRAINT "FK_surveys_patient"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_drug_interactions_drug1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_drug_interactions_drug2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" DROP CONSTRAINT "DrugInteractions_category_check"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."education_type_enum" AS ENUM('video', 'article', 'image')`,
    );
    await queryRunner.query(
      `CREATE TABLE "education" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category" character varying NOT NULL, "type" "public"."education_type_enum" NOT NULL, "url" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ddeeea22f44d83bf12f353a2697" UNIQUE ("globalId"), CONSTRAINT "PK_bf3d38701b3030a8ad634d43bd6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "Surgeries" DROP COLUMN "date"`);
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" DROP COLUMN "category"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."DrugInteractions_category_enum" AS ENUM('A', 'B', 'C', 'D', 'X')`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e6d8b5d616eacb862a76293c34" ON "Surgeries" ("patientId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e6d8b5d616eacb862a76293c34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" DROP COLUMN "category"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."DrugInteractions_category_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" ADD "category" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "Surgeries" DROP COLUMN "date"`);
    await queryRunner.query(`DROP TABLE "education"`);
    await queryRunner.query(`DROP TYPE "public"."education_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" ADD CONSTRAINT "DrugInteractions_category_check" CHECK (((category)::text = ANY ((ARRAY['A'::character varying, 'B'::character varying, 'C'::character varying, 'D'::character varying, 'X'::character varying])::text[])))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_drug_interactions_drug2" ON "DrugInteractions" ("drug2") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_drug_interactions_drug1" ON "DrugInteractions" ("drug1") `,
    );
    await queryRunner.query(
      `ALTER TABLE "Surgeries" ADD CONSTRAINT "FK_surveys_patient" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
