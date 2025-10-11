import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
import { CreateAgeDto } from './dto/create-age.dto';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { GetVitalSignHistoryDto } from './dto/get-vital-sign-history.dto';
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

  @Get('types')
  async getAllVitalSignTypes() {
    return await this.vitalSignsService.getAllVitalSignTypes();
  }

  @Get('history')
  async getVitalSignHistory(
    @Req() req: Request,
    @Query() getVitalSignHistoryDto: GetVitalSignHistoryDto,
  ) {
    const userData = req.user as JwtPayload;
    return await this.vitalSignsService.getVitalSignHistory(
      getVitalSignHistoryDto,
      userData,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vitalSignsService.findOne(id);
  }

  @Patch()
  update(@Body() updateVitalSignDto: UpdateVitalSignDto, @Req() req: Request) {
    const userData = req.user as JwtPayload;
    return this.vitalSignsService.update(updateVitalSignDto, userData);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vitalSignsService.remove(id);
  }
}
