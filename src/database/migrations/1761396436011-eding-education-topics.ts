import { MigrationInterface, QueryRunner } from 'typeorm';

export class EdingEducationTopics1761396436011 implements MigrationInterface {
  name = 'EdingEducationTopics1761396436011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."education_type_enum"`);
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN "url"`);
    await queryRunner.query(
      `ALTER TABLE "education" ADD "title" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "education" ADD "slug" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "education" ADD CONSTRAINT "UQ_af0bc095015303102f25d8714ea" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "education" ADD "description" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "education" ADD "content" json NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "education" ADD "readTime" integer`);
    await queryRunner.query(
      `ALTER TABLE "education" ADD "publishedAt" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "DrugInteractions" DROP COLUMN "category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "education" DROP COLUMN "publishedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN "readTime"`);
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN "content"`);
    await queryRunner.query(
      `ALTER TABLE "education" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "education" DROP CONSTRAINT "UQ_af0bc095015303102f25d8714ea"`,
    );
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN "slug"`);
    await queryRunner.query(`ALTER TABLE "education" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "Surgeries" DROP COLUMN "date"`);
    await queryRunner.query(
      `ALTER TABLE "education" ADD "url" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."education_type_enum" AS ENUM('video', 'article', 'image')`,
    );
    await queryRunner.query(
      `ALTER TABLE "education" ADD "type" "public"."education_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "education" ADD "name" character varying NOT NULL`,
    );
  }
}
