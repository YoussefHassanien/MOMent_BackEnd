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

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.educationRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async create(createEducationDto: CreateEducationDto) {
    const baseSlug = this.generateSlug(createEducationDto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const education = this.educationRepository.create({
      ...createEducationDto,
      slug,
    });
    const savedEducation = await this.educationRepository.save(education);

    return {
      id: savedEducation.globalId,
      title: savedEducation.title,
      slug: savedEducation.slug,
      description: savedEducation.description,
      category: savedEducation.category,
      content: savedEducation.content,
      readTime: savedEducation.readTime,
      publishedAt: savedEducation.publishedAt,
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
      title: education.title,
      slug: education.slug,
      description: education.description,
      category: education.category,
      content: education.content,
      readTime: education.readTime,
      publishedAt: education.publishedAt,
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
      title: education.title,
      slug: education.slug,
      description: education.description,
      category: education.category,
      content: education.content,
      readTime: education.readTime,
      publishedAt: education.publishedAt,
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
      title: education.title,
      slug: education.slug,
      description: education.description,
      category: education.category,
      content: education.content,
      readTime: education.readTime,
      publishedAt: education.publishedAt,
      createdAt: education.createdAt,
      updatedAt: education.updatedAt,
    }));
  }

  async findBySlug(slug: string) {
    const education = await this.educationRepository.findOne({
      where: { slug },
    });

    if (!education) {
      throw new NotFoundException({
        message: 'Education resource not found',
      });
    }

    return {
      id: education.globalId,
      title: education.title,
      slug: education.slug,
      description: education.description,
      category: education.category,
      content: education.content,
      readTime: education.readTime,
      publishedAt: education.publishedAt,
      createdAt: education.createdAt,
      updatedAt: education.updatedAt,
    };
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

    // If title is being updated, regenerate the slug
    let newSlug: string | undefined;
    if (
      updateEducationDto.title &&
      updateEducationDto.title !== education.title
    ) {
      const baseSlug = this.generateSlug(updateEducationDto.title);
      newSlug = await this.ensureUniqueSlug(baseSlug);
    }

    // Update the education resource
    Object.assign(education, updateEducationDto);
    if (newSlug) {
      education.slug = newSlug;
    }
    const updatedEducation = await this.educationRepository.save(education);

    return {
      id: updatedEducation.globalId,
      title: updatedEducation.title,
      slug: updatedEducation.slug,
      description: updatedEducation.description,
      category: updatedEducation.category,
      content: updatedEducation.content,
      readTime: updatedEducation.readTime,
      publishedAt: updatedEducation.publishedAt,
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
