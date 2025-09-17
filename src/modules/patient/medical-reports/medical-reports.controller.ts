import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '../../../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { MedicalReportsService } from './medical-reports.service';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(Role.PATIENT)
@Controller('medical-reports')
export class MedicalReportsController {
  constructor(private readonly medicalReportsService: MedicalReportsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|png|pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5 MB,
        })
        .build(),
    )
    file: Express.Multer.File,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.medicalReportsService.create(createReportDto);
  }

  @Get()
  findAll() {
    return this.medicalReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalReportsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalReportsService.remove(+id);
  }
}
