import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VitalSignType } from '../../../database/index';
import { VitalSignTypeController } from './vital-sign-type.controller';
import { VitalSignTypeService } from './vital-sign-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([VitalSignType])],
  controllers: [VitalSignTypeController],
  providers: [VitalSignTypeService],
})
export class VitalSignTypeModule {}
