import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { DashboardVitalSignsPeriod, Role } from '../../../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { JwtPayload } from '../../auth/jwt.payload';
import { Roles } from '../../auth/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('patient/dashboard')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(Role.PATIENT)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('vital-sign-types')
  async findAllVitalSignsTypes(@Req() req: Request) {
    const userData = req.user as JwtPayload;
    return await this.dashboardService.findAllVitalSignsTypes(userData);
  }

  @Get('vital-signs/readings/:id')
  async findOneVitalSign(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period', new ParseEnumPipe(DashboardVitalSignsPeriod))
    period: DashboardVitalSignsPeriod,
  ) {
    const userData = req.user as JwtPayload;
    return await this.dashboardService.findOneVitalSign(userData, id, period);
  }
}
