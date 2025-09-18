import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '../../../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateVitalSignTypeDto } from './dto/create-vital-sign-type.dto';
import { VitalSignTypeService } from './vital-sign-type.service';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(Role.ADMIN)
@Controller('admin/vital-sign-type')
export class VitalSignTypeController {
  constructor(private readonly vitalSignTypeService: VitalSignTypeService) {}

  @Post()
  async create(@Body() createVitalSignTypeDto: CreateVitalSignTypeDto) {
    return await this.vitalSignTypeService.create(createVitalSignTypeDto);
  }
}
