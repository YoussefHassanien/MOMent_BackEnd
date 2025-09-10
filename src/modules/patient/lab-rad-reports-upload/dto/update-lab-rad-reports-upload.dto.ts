import { PartialType } from '@nestjs/swagger';
import { CreateLabRadReportsUploadDto } from './create-lab-rad-reports-upload.dto';

export class UpdateLabRadReportsUploadDto extends PartialType(CreateLabRadReportsUploadDto) {}
