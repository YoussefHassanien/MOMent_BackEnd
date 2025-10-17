import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AllergiesTypes, Role } from '../../../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { JwtPayload } from '../../auth/jwt.payload';
import { Roles } from '../../auth/roles.decorator';
import { CreateFoodDrugAllergyDto } from './dto/create-food-drug-allergy.dto';
import { FoodDrugAllergiesService } from './food-drug-allergies.service';

@Controller('patient/food-drug-allergies')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(Role.PATIENT)
export class FoodDrugAllergiesController {
  constructor(
    private readonly foodDrugAllergiesService: FoodDrugAllergiesService,
  ) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createFoodDrugAllergyDto: CreateFoodDrugAllergyDto,
  ) {
    const userData = req.user as JwtPayload;
    return await this.foodDrugAllergiesService.create(
      createFoodDrugAllergyDto,
      userData,
    );
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('type', new ParseEnumPipe(AllergiesTypes)) type: AllergiesTypes,
  ) {
    const userData = req.user as JwtPayload;
    return await this.foodDrugAllergiesService.findAll(
      userData,
      type,
      page,
      limit,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userData = req.user as JwtPayload;
    return await this.foodDrugAllergiesService.remove(userData, id);
  }
}
