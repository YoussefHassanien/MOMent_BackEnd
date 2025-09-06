import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeDateOfBirthNullable1757108049769 implements MigrationInterface {
    name = 'MadeDateOfBirthNullable1757108049769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Patients" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "Patients" ADD "dateOfBirth" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Patients" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "Patients" ADD "dateOfBirth" TIMESTAMP NOT NULL`);
    }

}
