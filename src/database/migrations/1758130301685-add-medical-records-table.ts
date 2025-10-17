import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMedicalRecordsTable1758130301685 implements MigrationInterface {
  name = 'AddMedicalRecordsTable1758130301685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."Medical-Reports_type_enum" AS ENUM('Lab', 'Rad')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Medical-Reports" ("id" SERIAL NOT NULL, "globalId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."Medical-Reports_type_enum" NOT NULL, "date" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer NOT NULL, CONSTRAINT "UQ_d8545144b0758790994423a6603" UNIQUE ("globalId"), CONSTRAINT "PK_16cb3ed81e585708a68ae611d61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Medical-Reports" ADD CONSTRAINT "FK_41dff102aefb3ccee704e5b2143" FOREIGN KEY ("patientId") REFERENCES "Patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Medical-Reports" DROP CONSTRAINT "FK_41dff102aefb3ccee704e5b2143"`,
    );
    await queryRunner.query(`DROP TABLE "Medical-Reports"`);
    await queryRunner.query(`DROP TYPE "public"."Medical-Reports_type_enum"`);
  }
}
