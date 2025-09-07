import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient, VitalSign, VitalSignType } from '../../../database/index';
import { VitalSignsController } from './vital-signs.controller';
import { VitalSignsService } from './vital-signs.service';

@Module({
  imports: [TypeOrmModule.forFeature([VitalSign, VitalSignType, Patient])],
  controllers: [VitalSignsController],
  providers: [VitalSignsService],
})
export class VitalSignsModule {}
