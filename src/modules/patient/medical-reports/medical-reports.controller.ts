import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Role } from '../../../constants/enums';
import { JwtPayload } from '../../../modules/auth/jwt.payload';
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
  async create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(image\/jpeg|image\/jpg|image\/png|application\/pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5 MB,
        })
        .build(),
    )
    file: Express.Multer.File,
    @Body() createReportDto: CreateReportDto,
    @Req() req: Request,
  ) {
    const userData = req.user as JwtPayload;
    return await this.medicalReportsService.create(
      file,
      createReportDto,
      userData,
    );
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    const userData = req.user as JwtPayload;
    return await this.medicalReportsService.findAll(userData, page, limit);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userData = req.user as JwtPayload;
    return await this.medicalReportsService.remove(id, userData);
  }
}
