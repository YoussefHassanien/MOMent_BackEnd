import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@Controller('patient/education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Post()
  async create(@Body() createEducationDto: CreateEducationDto) {
    return await this.educationService.create(createEducationDto);
  }

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('type') type?: string,
  ) {
    if (category) {
      return await this.educationService.findByCategory(category);
    }
    if (type) {
      return await this.educationService.findByType(type);
    }
    return await this.educationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.educationService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    return await this.educationService.update(id, updateEducationDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.educationService.remove(id);
  }
}
