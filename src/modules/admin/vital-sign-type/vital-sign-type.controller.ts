import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateVitalSignTypeDto } from './dto/create-vital-sign-type.dto';
import { UpdateVitalSignTypeDto } from './dto/update-vital-sign-type.dto';
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

  @Get()
  findAll() {
    return this.vitalSignTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vitalSignTypeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVitalSignTypeDto: UpdateVitalSignTypeDto,
  ) {
    return this.vitalSignTypeService.update(+id, updateVitalSignTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vitalSignTypeService.remove(+id);
  }
}
