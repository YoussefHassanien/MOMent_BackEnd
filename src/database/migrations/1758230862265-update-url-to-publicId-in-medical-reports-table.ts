import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUrlToPublicIdInMedicalReportsTable1758230862265 implements MigrationInterface {
    name = 'UpdateUrlToPublicIdInMedicalReportsTable1758230862265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Medical-Reports" RENAME COLUMN "url" TO "publicId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Medical-Reports" RENAME COLUMN "publicId" TO "url"`);
    }

}
