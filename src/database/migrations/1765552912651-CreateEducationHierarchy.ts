import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEducationHierarchy1765552912651
  implements MigrationInterface
{
  name = 'CreateEducationHierarchy1765552912651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "education_category" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "title" json NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_475cf42da393f566e0a0439dbd2" UNIQUE ("globalId"), CONSTRAINT "UQ_bb7fa491b951378919c19d83669" UNIQUE ("key"), CONSTRAINT "PK_6294a5eb53521c0dd2e8a651a1f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."education_content_type_enum" AS ENUM('text', 'video', 'link')`,
    );
    await queryRunner.query(
      `CREATE TABLE "education_content" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "subCategoryId" integer NOT NULL, "title" json NOT NULL, "body" json NOT NULL, "type" "public"."education_content_type_enum" NOT NULL, "externalUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6afaa58a670ee1b6a452de8412c" UNIQUE ("globalId"), CONSTRAINT "PK_23ff8469434cb6826c11fe0f7f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "education_subcategory" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "categoryId" integer NOT NULL, "title" json NOT NULL, "order" integer NOT NULL, "parentSubCategoryId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_528464c9265f1a4bd5a3857d7af" UNIQUE ("globalId"), CONSTRAINT "PK_59bb1e6f32ca89b129916c22bf0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "education_content" ADD CONSTRAINT "FK_c7af7df78f5425dd59cf6a70635" FOREIGN KEY ("subCategoryId") REFERENCES "education_subcategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "education_subcategory" ADD CONSTRAINT "FK_c85a67934b2957a083e60f798dc" FOREIGN KEY ("categoryId") REFERENCES "education_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "education_subcategory" ADD CONSTRAINT "FK_e4fb96d2006b0a435f5d63cba05" FOREIGN KEY ("parentSubCategoryId") REFERENCES "education_subcategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "education_subcategory" DROP CONSTRAINT "FK_e4fb96d2006b0a435f5d63cba05"`,
    );
    await queryRunner.query(
      `ALTER TABLE "education_subcategory" DROP CONSTRAINT "FK_c85a67934b2957a083e60f798dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "education_content" DROP CONSTRAINT "FK_c7af7df78f5425dd59cf6a70635"`,
    );
    await queryRunner.query(`DROP TABLE "education_subcategory"`);
    await queryRunner.query(`DROP TABLE "education_content"`);
    await queryRunner.query(`DROP TYPE "public"."education_content_type_enum"`);
    await queryRunner.query(`DROP TABLE "education_category"`);
  }
}
