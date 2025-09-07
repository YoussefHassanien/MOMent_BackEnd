import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { VitalSignsService } from './vital-signs.service';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { UpdateVitalSignDto } from './dto/update-vital-sign.dto';
import JwtPayload from 'src/modules/auth/jwt.payload';
import {
  AuthenticationGuard,
  AuthorizationGuard,
} from 'src/modules/auth/auth.guard';
import { Role } from 'src/constants/enums';
import { Roles } from 'src/modules/auth/roles.decorator';

@Controller('patient/vital-signs')
export class VitalSignsController {
  constructor(private readonly vitalSignsService: VitalSignsService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.PATIENT)
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
  findOne(@Param('id') id: string) {
    return this.vitalSignsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVitalSignDto: UpdateVitalSignDto,
  ) {
    return this.vitalSignsService.update(+id, updateVitalSignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vitalSignsService.remove(+id);
  }
}
