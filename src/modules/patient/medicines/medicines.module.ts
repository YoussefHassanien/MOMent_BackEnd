import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DrugInteraction,
  Medicine,
  Patient,
  PatientMedicine,
} from '../../../database';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Medicine,
      PatientMedicine,
      DrugInteraction,
    ]),
  ],
  providers: [MedicinesService],
  controllers: [MedicinesController],
  exports: [MedicinesService],
})
export class MedicinesModule {}
