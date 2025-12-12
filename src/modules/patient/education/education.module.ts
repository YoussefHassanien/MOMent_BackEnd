import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationCategory } from '../../../database/entities/education-category.entity';
import { EducationSubCategory } from '../../../database/entities/education-subcategory.entity';
import { EducationContent } from '../../../database/entities/education-content.entity';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EducationCategory,
      EducationSubCategory,
      EducationContent,
    ]),
  ],
  controllers: [EducationController],
  providers: [EducationService],
})
export class EducationModule {}
