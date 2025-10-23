import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class AddDrugInteractionsTable1762000000000 implements MigrationInterface {
  name = 'AddDrugInteractionsTable1762000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the DrugInteractions table
    await queryRunner.query(`
      CREATE TABLE "DrugInteractions" (
        "id" SERIAL NOT NULL,
        "drug1" character varying(255) NOT NULL,
        "drug2" character varying(255) NOT NULL,
        "category" character varying NOT NULL CHECK ("category" IN ('A', 'B', 'C', 'D', 'X')),
        "description" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_drug_interactions" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_drug_interactions_drug1" ON "DrugInteractions" ("drug1")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_drug_interactions_drug2" ON "DrugInteractions" ("drug2")
    `);

    // Populate the table with data from CSV
    const csvPath = path.join(process.cwd(), 'drug- drug interactions.csv');
    if (fs.existsSync(csvPath)) {
      const data = fs.readFileSync(csvPath, 'utf-8');
      const lines = data.split('\n').slice(1); // skip header

      const interactions: Array<{
        drug1: string;
        drug2: string;
        category: 'A' | 'B' | 'C' | 'D' | 'X';
        description: string;
      }> = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        const fields = line.split(',').map(f => f.trim());
        if (fields.length < 3) continue;

        const drug1 = fields[0];
        const drug2 = fields[1];
        const category = fields[2] as 'A' | 'B' | 'C' | 'D' | 'X';
        const description = fields.length > 5 && fields[5] ? fields[5] : this.getDefaultDescription(category);

        if (!drug1 || !drug2 || !category || !['A', 'B', 'C', 'D', 'X'].includes(category)) continue;

        interactions.push({
          drug1: drug1.replace(/'/g, "''"), // escape single quotes
          drug2: drug2.replace(/'/g, "''"), // escape single quotes
          category,
          description: description.replace(/'/g, "''"), // escape single quotes
        });
      }

      // Insert data in batches to avoid query size limits
      const batchSize = 100;
      for (let i = 0; i < interactions.length; i += batchSize) {
        const batch = interactions.slice(i, i + batchSize);
        const values = batch.map(interaction =>
          `('${interaction.drug1}', '${interaction.drug2}', '${interaction.category}', '${interaction.description}')`
        ).join(', ');

        await queryRunner.query(`
          INSERT INTO "DrugInteractions" ("drug1", "drug2", "category", "description")
          VALUES ${values}
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_drug_interactions_drug2"`);
    await queryRunner.query(`DROP INDEX "IDX_drug_interactions_drug1"`);
    await queryRunner.query(`DROP TABLE "DrugInteractions"`);
  }

  private getDefaultDescription(category: 'A' | 'B' | 'C' | 'D' | 'X'): string {
    const descriptions: Record<string, string> = {
      A: 'No known interaction',
      B: 'No action needed',
      C: 'Monitor therapy',
      D: 'Consider therapy modification',
      X: 'Avoid combination',
    };
    return descriptions[category] || 'Unknown interaction';
  }
}