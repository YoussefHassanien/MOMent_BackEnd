import { Module } from '@nestjs/common';
import { VitalSignsService } from './vital-signs.service';
import { VitalSignsController } from './vital-signs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VitalSign, VitalSignType, Patient } from '../../../database/index';

@Module({
  imports: [TypeOrmModule.forFeature([VitalSign, VitalSignType, Patient])],
  controllers: [VitalSignsController],
  providers: [VitalSignsService],
})
export class VitalSignsModule {}
