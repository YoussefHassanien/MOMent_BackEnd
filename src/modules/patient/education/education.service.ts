import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Education } from '../../../database';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(Education)
    private readonly educationRepository: Repository<Education>,
  ) {}

  async create(createEducationDto: CreateEducationDto) {
    // Check if education resource with the same name already exists
    const existingEducation = await this.educationRepository.findOne({
      where: { name: createEducationDto.name },
    });

    if (existingEducation) {
      throw new ConflictException({
        message: 'Education resource with this name already exists',
      });
    }

    const education = this.educationRepository.create(createEducationDto);
    const savedEducation = await this.educationRepository.save(education);

    return {
      id: savedEducation.globalId,
      name: savedEducation.name,
      category: savedEducation.category,
      type: savedEducation.type,
      url: savedEducation.url,
      createdAt: savedEducation.createdAt,
      updatedAt: savedEducation.updatedAt,
    };
  }

  async findAll() {
    const educations = await this.educationRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return educations.map((education) => ({
      id: education.globalId,
      name: education.name,
      category: education.category,
      type: education.type,
      url: education.url,
      createdAt: education.createdAt,
      updatedAt: education.updatedAt,
    }));
  }

  async findOne(id: string) {
    const education = await this.educationRepository.findOne({
      where: { globalId: id },
    });

    if (!education) {
      throw new NotFoundException({
        message: 'Education resource not found',
      });
    }

    return {
      id: education.globalId,
      name: education.name,
      category: education.category,
      type: education.type,
      url: education.url,
      createdAt: education.createdAt,
      updatedAt: education.updatedAt,
    };
  }

  async findByCategory(category: string) {
    const educations = await this.educationRepository.find({
      where: { category },
      order: {
        createdAt: 'DESC',
      },
    });

    return educations.map((education) => ({
      id: education.globalId,
      name: education.name,
      category: education.category,
      type: education.type,
      url: education.url,
      createdAt: education.createdAt,
      updatedAt: education.updatedAt,
    }));
  }

  async findByType(type: string) {
    const educations = await this.educationRepository.find({
      where: { type: type as any },
      order: {
        createdAt: 'DESC',
      },
    });

    return educations.map((education) => ({
      id: education.globalId,
      name: education.name,
      category: education.category,
      type: education.type,
      url: education.url,
      createdAt: education.createdAt,
      updatedAt: education.updatedAt,
    }));
  }

  async update(id: string, updateEducationDto: UpdateEducationDto) {
    const education = await this.educationRepository.findOne({
      where: { globalId: id },
    });

    if (!education) {
      throw new NotFoundException({
        message: 'Education resource not found',
      });
    }

    // Check if updating name to an existing name
    if (updateEducationDto.name && updateEducationDto.name !== education.name) {
      const existingEducation = await this.educationRepository.findOne({
        where: { name: updateEducationDto.name },
      });

      if (existingEducation) {
        throw new ConflictException({
          message: 'Education resource with this name already exists',
        });
      }
    }

    // Update the education resource
    Object.assign(education, updateEducationDto);
    const updatedEducation = await this.educationRepository.save(education);

    return {
      id: updatedEducation.globalId,
      name: updatedEducation.name,
      category: updatedEducation.category,
      type: updatedEducation.type,
      url: updatedEducation.url,
      createdAt: updatedEducation.createdAt,
      updatedAt: updatedEducation.updatedAt,
    };
  }

  async remove(id: string) {
    const education = await this.educationRepository.findOne({
      where: { globalId: id },
    });

    if (!education) {
      throw new NotFoundException({
        message: 'Education resource not found',
      });
    }

    await this.educationRepository.remove(education);

    return {
      message: 'Education resource deleted successfully',
      id: id,
    };
  }
}
