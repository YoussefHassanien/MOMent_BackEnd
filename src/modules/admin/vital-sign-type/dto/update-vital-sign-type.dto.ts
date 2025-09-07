import { PartialType } from '@nestjs/swagger';
import { CreateVitalSignTypeDto } from './create-vital-sign-type.dto';

export class UpdateVitalSignTypeDto extends PartialType(
  CreateVitalSignTypeDto,
) {}
