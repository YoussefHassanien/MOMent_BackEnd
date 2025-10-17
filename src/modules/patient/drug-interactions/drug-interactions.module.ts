import { Module } from '@nestjs/common';
import { DrugInteractionsController } from './drug-interactions.controller';
import { DrugInteractionsService } from './drug-interactions.service';

@Module({
  controllers: [DrugInteractionsController],
  providers: [DrugInteractionsService],
})
export class DrugInteractionsModule {}
