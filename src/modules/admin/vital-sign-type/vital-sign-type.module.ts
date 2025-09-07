import { Module } from '@nestjs/common';
import { VitalSignTypeService } from './vital-sign-type.service';
import { VitalSignTypeController } from './vital-sign-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VitalSignType } from '../../../database/index';

@Module({
  imports: [TypeOrmModule.forFeature([VitalSignType])],
  controllers: [VitalSignTypeController],
  providers: [VitalSignTypeService],
})
export class VitalSignTypeModule {}
