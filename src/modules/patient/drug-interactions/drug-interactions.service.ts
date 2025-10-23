import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrugInteraction } from '../../../database';
import { CreateDrugInteractionDto, UpdateDrugInteractionDto } from './dto/admin-drug-interactions.dto';

@Injectable()
export class DrugInteractionsService implements OnModuleInit {
  private drugSet: Set<string> = new Set();

  constructor(
    @InjectRepository(DrugInteraction)
    private readonly drugInteractionRepository: Repository<DrugInteraction>,
  ) {}

  async onModuleInit() {
    await this.loadDrugSet();
  }

  private async loadDrugSet() {
    const interactions = await this.drugInteractionRepository.find({
      select: ['drug1', 'drug2'],
    });

    this.drugSet.clear();
    interactions.forEach(interaction => {
      this.drugSet.add(interaction.drug1);
      this.drugSet.add(interaction.drug2);
    });
  }

  getAllDrugs(): string[] {
    return Array.from(this.drugSet).sort();
  }

  async checkInteractions(drugs: string[]): Promise<{
    interactions: {
      drug1: string;
      drug2: string;
      category: 'A' | 'B' | 'C' | 'D' | 'X';
      description: string;
    }[];
    warnings: string[];
  }> {
    const interactions: {
      drug1: string;
      drug2: string;
      category: 'A' | 'B' | 'C' | 'D' | 'X';
      description: string;
    }[] = [];
    const warnings: string[] = [];
    const uniqueDrugs = [...new Set(drugs)];

    if (uniqueDrugs.length < 2) {
      warnings.push('Please enter at least two drugs to check for interactions');
      return { interactions, warnings };
    }

    if (uniqueDrugs.length !== drugs.length) {
      warnings.push('Duplicate drugs found, duplicates removed');
    }

    const unknownDrugs = uniqueDrugs.filter(drug => !this.drugSet.has(drug));
    if (unknownDrugs.length > 0) {
      warnings.push(`Unknown drugs: ${unknownDrugs.join(', ')}. Please check spelling or choose from suggestions.`);
    }

    // Check pairwise interactions
    for (let i = 0; i < uniqueDrugs.length; i++) {
      for (let j = i + 1; j < uniqueDrugs.length; j++) {
        const drug1 = uniqueDrugs[i];
        const drug2 = uniqueDrugs[j];

        // Check both combinations since the data might be stored in either order
        const interaction = await this.drugInteractionRepository.findOne({
          where: [
            { drug1, drug2 },
            { drug1: drug2, drug2: drug1 }
          ]
        });

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

  // Admin methods
  async getAllDrugInteractions(): Promise<DrugInteraction[]> {
    return await this.drugInteractionRepository.find({
      order: { id: 'ASC' },
    });
  }

  async createDrugInteraction(dto: CreateDrugInteractionDto): Promise<DrugInteraction> {
    const interaction = this.drugInteractionRepository.create(dto);
    const savedInteraction = await this.drugInteractionRepository.save(interaction);

    // Refresh the drug set cache
    await this.loadDrugSet();

    return savedInteraction;
  }

  async updateDrugInteraction(id: number, dto: UpdateDrugInteractionDto): Promise<DrugInteraction> {
    const interaction = await this.drugInteractionRepository.findOneBy({ id });

    if (!interaction) {
      throw new NotFoundException(`Drug interaction with ID ${id} not found`);
    }

    // Update the interaction with the provided fields
    Object.assign(interaction, dto);
    const updatedInteraction = await this.drugInteractionRepository.save(interaction);

    // Refresh the drug set cache
    await this.loadDrugSet();

    return updatedInteraction;
  }

  async deleteDrugInteraction(id: number): Promise<{ message: string }> {
    const interaction = await this.drugInteractionRepository.findOneBy({ id });

    if (!interaction) {
      throw new NotFoundException(`Drug interaction with ID ${id} not found`);
    }

    await this.drugInteractionRepository.remove(interaction);

    // Refresh the drug set cache
    await this.loadDrugSet();

    return { message: 'Drug interaction deleted successfully' };
  }
}
