import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugInteraction } from '../../../database';
import { DrugInteractionsController } from './drug-interactions.controller';
import { DrugInteractionsService } from './drug-interactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([DrugInteraction])],
  controllers: [DrugInteractionsController],
  providers: [DrugInteractionsService],
})
export class DrugInteractionsModule {}
