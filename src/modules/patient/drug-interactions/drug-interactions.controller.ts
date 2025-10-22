import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '../../../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { CheckInteractionsDto } from './dto/check-interactions.dto';
import { CheckInteractionsResponseDto } from './dto/interaction-result.dto';
import { CreateDrugInteractionDto, UpdateDrugInteractionDto } from './dto/admin-drug-interactions.dto';
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

  // Admin endpoints
  @Get('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all drug interactions with IDs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all drug interactions',
  })
  async getAllDrugInteractions() {
    return await this.drugInteractionsService.getAllDrugInteractions();
  }

  @Post('admin')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new drug interaction (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Drug interaction created successfully',
  })
  async createDrugInteraction(@Body() dto: CreateDrugInteractionDto) {
    return await this.drugInteractionsService.createDrugInteraction(dto);
  }

  @Put('admin/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a drug interaction (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Drug interaction updated successfully',
  })
  async updateDrugInteraction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDrugInteractionDto,
  ) {
    return await this.drugInteractionsService.updateDrugInteraction(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a drug interaction (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Drug interaction deleted successfully',
  })
  async deleteDrugInteraction(@Param('id', ParseIntPipe) id: number) {
    return await this.drugInteractionsService.deleteDrugInteraction(id);
  }
}
