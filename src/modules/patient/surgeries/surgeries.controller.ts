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
import { Role } from '../../../constants/enums';
import { JwtPayload } from '../../../modules/auth/jwt.payload';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateSurgeryDto } from './dto/create-surgery.dto';
import { UpdateSurgeryDto } from './dto/update-surgery.dto';
import { SurgeriesService } from './surgeries.service';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(Role.PATIENT)
@Controller('surgeries')
export class SurgeriesController {
  constructor(private readonly surgeriesService: SurgeriesService) {}

  @Post()
  async create(@Body() createSurgeryDto: CreateSurgeryDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return await this.surgeriesService.create(createSurgeryDto, user);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 30,
  ) {
    const user = req.user as JwtPayload;
    return await this.surgeriesService.findAll(user, Number(page), Number(limit));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSurgeryDto: UpdateSurgeryDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return await this.surgeriesService.update(id, updateSurgeryDto, user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return await this.surgeriesService.remove(id, user);
  }
}
