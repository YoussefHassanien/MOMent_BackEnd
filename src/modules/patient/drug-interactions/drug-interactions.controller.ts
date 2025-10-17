import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '../../../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { CheckInteractionsDto } from './dto/check-interactions.dto';
import { CheckInteractionsResponseDto } from './dto/interaction-result.dto';
import { DrugInteractionsService } from './drug-interactions.service';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(Role.PATIENT)
@Controller('patient/drug-interactions')
export class DrugInteractionsController {
  constructor(
    private readonly drugInteractionsService: DrugInteractionsService,
  ) {}

  @Get('drugs')
  @ApiOperation({ summary: 'Get list of available drugs' })
  @ApiResponse({
    status: 200,
    description: 'List of drugs',
    schema: {
      type: 'object',
      properties: {
        drugs: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  getDrugs() {
    return { drugs: this.drugInteractionsService.getAllDrugs() };
  }

  @Post('check')
  @ApiOperation({ summary: 'Check drug interactions' })
  @ApiResponse({
    status: 200,
    description: 'Interaction results',
    type: CheckInteractionsResponseDto,
  })
  checkInteractions(@Body() dto: CheckInteractionsDto) {
    return this.drugInteractionsService.checkInteractions(dto.drugs);
  }
}
