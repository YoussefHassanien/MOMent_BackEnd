import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateLabRadReportsUploadDto } from './dto/create-lab-rad-reports-upload.dto';
import { UpdateLabRadReportsUploadDto } from './dto/update-lab-rad-reports-upload.dto';
import { LabRadReportsUploadService } from './lab-rad-reports-upload.service';

@Controller('lab-rad-reports-upload')
export class LabRadReportsUploadController {
  constructor(
    private readonly labRadReportsUploadService: LabRadReportsUploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {}))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createLabRadReportsUploadDto: CreateLabRadReportsUploadDto,
  ) {
    return this.labRadReportsUploadService.create(createLabRadReportsUploadDto);
  }

  @Get()
  findAll() {
    return this.labRadReportsUploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labRadReportsUploadService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLabRadReportsUploadDto: UpdateLabRadReportsUploadDto,
  ) {
    return this.labRadReportsUploadService.update(
      +id,
      updateLabRadReportsUploadDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labRadReportsUploadService.remove(+id);
  }
}
