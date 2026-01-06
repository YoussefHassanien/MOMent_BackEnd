import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStartAndEndDatesToPatientMedicine1767734358101 implements MigrationInterface {
    name = 'AddStartAndEndDatesToPatientMedicine1767734358101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PatientMedicines" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "PatientMedicines" ADD "startDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "PatientMedicines" ADD "endDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PatientMedicines" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "PatientMedicines" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "PatientMedicines" ADD "duration" character varying`);
    }

}
