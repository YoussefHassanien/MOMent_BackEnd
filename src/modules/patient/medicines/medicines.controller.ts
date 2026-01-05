import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../../constants/enums';
import { JwtPayload } from '../../auth/jwt.payload';
import { MedicinesService } from './medicines.service';
import { CreatePatientMedicineDto } from './dto/create-patient-medicine.dto';
import { UpdatePatientMedicineDto } from './dto/update-patient-medicine.dto';

@Controller('patient/medicines')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(Role.PATIENT, Role.ADMIN)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 30,
  ) {
    return this.medicinesService.search(q || '', page, limit);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreatePatientMedicineDto) {
    const userData = req.user as JwtPayload;
    return this.medicinesService.createPatientMedicine(dto, userData);
  }

  @Get()
  async list(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 50,
  ) {
    const userData = req.user as JwtPayload;
    return this.medicinesService.listPatientMedicines(userData, page, limit);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientMedicineDto,
    @Req() req: Request,
  ) {
    const userData = req.user as JwtPayload;
    return this.medicinesService.updatePatientMedicine(id, dto, userData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userData = req.user as JwtPayload;
    return this.medicinesService.removePatientMedicine(id, userData);
  }
}
