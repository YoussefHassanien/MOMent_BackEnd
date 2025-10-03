import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../../../constants/enums';
import {
  AuthenticationGuard,
  AuthorizationGuard,
} from '../../../modules/auth/auth.guard';
import { JwtPayload } from '../../../modules/auth/jwt.payload';
import { Roles } from '../../../modules/auth/roles.decorator';
import { CreateAgeDto } from './dto/create-age.dto';
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

  @Post('age')
  async createAge(@Req() req: Request, @Body() createAgeDto: CreateAgeDto) {
    const userData = req.user as JwtPayload;
    return await this.vitalSignsService.createAge(createAgeDto, userData);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const userData = req.user as JwtPayload;
    return await this.vitalSignsService.findAll(userData);
  }

  @Patch()
  update(@Body() updateVitalSignDto: UpdateVitalSignDto, @Req() req: Request) {
    const userData = req.user as JwtPayload;
    return this.vitalSignsService.update(updateVitalSignDto, userData);
  }
}
