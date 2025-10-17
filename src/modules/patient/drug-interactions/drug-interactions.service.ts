import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface Interaction {
  category: 'A' | 'B' | 'C' | 'D' | 'X';
  description: string;
}

const descriptions: Record<string, string> = {
  A: 'No known interaction',
  B: 'No action needed',
  C: 'Monitor therapy',
  D: 'Consider therapy modification',
  X: 'Avoid combination',
};

@Injectable()
export class DrugInteractionsService implements OnModuleInit {
  private interactions: Map<string, Interaction> = new Map();
  private drugSet: Set<string> = new Set();

  onModuleInit() {
    this.loadInteractions();
  }

  private loadInteractions() {
    const csvPath = path.join(process.cwd(), 'drug- drug interactions.csv');
    if (!fs.existsSync(csvPath)) {
      console.warn('Drug interactions CSV file not found');
      return;
    }

    const data = fs.readFileSync(csvPath, 'utf-8');
    const lines = data.split('\n').slice(1); // skip header

    for (const line of lines) {
      if (!line.trim()) continue;
      const fields = line.split(',').map((f) => f.trim());
      if (fields.length < 3) continue;

      const drug1 = fields[0];
      const drug2 = fields[1];
      const category = fields[2] as 'A' | 'B' | 'C' | 'D' | 'X';
      const description =
        fields.length > 5 && fields[5]
          ? fields[5]
          : descriptions[category] || 'Unknown interaction';

      if (!category || !['A', 'B', 'C', 'D', 'X'].includes(category)) continue;

      const key = [drug1, drug2].sort().join(',');
      this.interactions.set(key, { category, description });
      this.drugSet.add(drug1);
      this.drugSet.add(drug2);
    }
  }

  getAllDrugs(): string[] {
    return Array.from(this.drugSet).sort();
  }

  checkInteractions(drugs: string[]): {
    interactions: {
      drug1: string;
      drug2: string;
      category: 'A' | 'B' | 'C' | 'D' | 'X';
      description: string;
    }[];
    warnings: string[];
  } {
    const interactions: {
      drug1: string;
      drug2: string;
      category: 'A' | 'B' | 'C' | 'D' | 'X';
      description: string;
    }[] = [];
    const warnings: string[] = [];
    const uniqueDrugs = [...new Set(drugs)];

    if (uniqueDrugs.length < 2) {
      warnings.push(
        'Please enter at least two drugs to check for interactions',
      );
      return { interactions, warnings };
    }

    if (uniqueDrugs.length !== drugs.length) {
      warnings.push('Duplicate drugs found, duplicates removed');
    }

    const unknownDrugs = uniqueDrugs.filter((drug) => !this.drugSet.has(drug));
    if (unknownDrugs.length > 0) {
      warnings.push(
        `Unknown drugs: ${unknownDrugs.join(', ')}. Please check spelling or choose from suggestions.`,
      );
    }

    // Check pairwise interactions
    for (let i = 0; i < uniqueDrugs.length; i++) {
      for (let j = i + 1; j < uniqueDrugs.length; j++) {
        const drug1 = uniqueDrugs[i];
        const drug2 = uniqueDrugs[j];
        const key = [drug1, drug2].sort().join(',');
        const interaction = this.interactions.get(key);
        if (interaction) {
          interactions.push({
            drug1,
            drug2,
            category: interaction.category,
            description: interaction.description,
          });
        }
      }
    }

    return { interactions, warnings };
  }
}
