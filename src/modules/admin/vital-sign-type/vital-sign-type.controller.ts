import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VitalSignTypeService } from './vital-sign-type.service';
import { CreateVitalSignTypeDto } from './dto/create-vital-sign-type.dto';
import { UpdateVitalSignTypeDto } from './dto/update-vital-sign-type.dto';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../../constants/enums';

@Controller('admin/vital-sign-type')
export class VitalSignTypeController {
  constructor(private readonly vitalSignTypeService: VitalSignTypeService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
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
