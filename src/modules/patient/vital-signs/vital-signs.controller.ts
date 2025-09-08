import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/constants/enums';
import {
  AuthenticationGuard,
  AuthorizationGuard,
} from 'src/modules/auth/auth.guard';
import { JwtPayload } from 'src/modules/auth/jwt.payload';
import { Roles } from 'src/modules/auth/roles.decorator';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { UpdateVitalSignDto } from './dto/update-vital-sign.dto';
import { VitalSignsService } from './vital-signs.service';

@Controller('patient/vital-signs')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(Role.PATIENT)
export class VitalSignsController {
  constructor(private readonly vitalSignsService: VitalSignsService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createVitalSignDto: CreateVitalSignDto,
  ) {
    const userData = req.user as JwtPayload;
    return await this.vitalSignsService.create(createVitalSignDto, userData);
  }

  @Get()
  findAll() {
    return this.vitalSignsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vitalSignsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVitalSignDto: UpdateVitalSignDto,
  ) {
    return this.vitalSignsService.update(id, updateVitalSignDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vitalSignsService.remove(id);
  }
}
