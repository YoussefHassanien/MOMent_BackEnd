import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allergy, Patient } from '../../../database';
import { FoodDrugAllergiesController } from './food-drug-allergies.controller';
import { FoodDrugAllergiesService } from './food-drug-allergies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Allergy, Patient])],
  controllers: [FoodDrugAllergiesController],
  providers: [FoodDrugAllergiesService],
})
export class FoodDrugAllergiesModule {}
