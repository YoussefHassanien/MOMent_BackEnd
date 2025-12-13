import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../../../database/entities/patient.entity';
import { Medicine } from '../../../database/entities/medicine.entity';
import { PatientMedicine } from '../../../database/entities/patient-medicine.entity';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Medicine, PatientMedicine])],
  providers: [MedicinesService],
  controllers: [MedicinesController],
  exports: [MedicinesService],
})
export class MedicinesModule {}
