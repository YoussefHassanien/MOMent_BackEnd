import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { EducationCategory } from '../../../database/entities/education-category.entity';
import { EducationSubCategory } from '../../../database/entities/education-subcategory.entity';
import { EducationContent } from '../../../database/entities/education-content.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { CreateContentDto } from './dto/create-content.dto';

type Language = 'en' | 'ar';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(EducationCategory)
    private readonly categoryRepository: Repository<EducationCategory>,
    @InjectRepository(EducationSubCategory)
    private readonly subCategoryRepository: Repository<EducationSubCategory>,
    @InjectRepository(EducationContent)
    private readonly contentRepository: Repository<EducationContent>,
  ) {}

  // Helper to format response based on language
  private formatResponse(data: any, lang: Language) {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.formatResponse(item, lang));
    }

    const formatted: any = { ...data };

    if (data.title && typeof data.title === 'object') {
      formatted.title = data.title[lang] || data.title.en;
    }

    if (data.body && typeof data.body === 'object') {
      formatted.body = data.body[lang] || data.body.en;
    }

    return formatted;
  }

  // CATEGORY METHODS

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepository.findOne({
      where: { key: createCategoryDto.key },
    });

    if (existingCategory) {
      throw new ConflictException({
        message: 'Category with this key already exists',
      });
    }

    const category = this.categoryRepository.create(createCategoryDto);
    const savedCategory = await this.categoryRepository.save(category);

    return {
      id: savedCategory.globalId,
      key: savedCategory.key,
      title: savedCategory.title,
      order: savedCategory.order,
    };
  }

  async getAllCategories(lang: Language = 'en') {
    const categories = await this.categoryRepository.find({
      order: { order: 'ASC' },
    });

    return categories.map((category) => ({
      id: category.globalId,
      key: category.key,
      title: category.title[lang],
      order: category.order,
    }));
  }

  async getCategoryById(id: string, lang: Language = 'en') {
    const category = await this.categoryRepository.findOne({
      where: { globalId: id },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
      });
    }

    return {
      id: category.globalId,
      key: category.key,
      title: category.title[lang],
      order: category.order,
    };
  }

  // SUBCATEGORY METHODS

  async createSubCategory(createSubCategoryDto: CreateSubCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { globalId: createSubCategoryDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
      });
    }

    let parentSubCategory: EducationSubCategory | null = null;
    if (createSubCategoryDto.parentSubCategoryId) {
      parentSubCategory = await this.subCategoryRepository.findOne({
        where: { globalId: createSubCategoryDto.parentSubCategoryId },
      });

      if (!parentSubCategory) {
        throw new NotFoundException({
          message: 'Parent subcategory not found',
        });
      }
    }

    const subCategory = this.subCategoryRepository.create({
      categoryId: category.id,
      title: createSubCategoryDto.title,
      order: createSubCategoryDto.order,
      ...(parentSubCategory && { parentSubCategoryId: parentSubCategory.id }),
    });

    const savedSubCategory = await this.subCategoryRepository.save(subCategory);

    return {
      id: savedSubCategory.globalId,
      categoryId: category.globalId,
      title: savedSubCategory.title,
      order: savedSubCategory.order,
      parentSubCategoryId: parentSubCategory?.globalId,
    };
  }

  async getSubCategoriesByCategory(categoryId: string, lang: Language = 'en') {
    const category = await this.categoryRepository.findOne({
      where: { globalId: categoryId },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
      });
    }

    const subCategories = await this.subCategoryRepository.find({
      where: {
        categoryId: category.id,
        parentSubCategoryId: IsNull(),
      },
      order: { order: 'ASC' },
    });

    return subCategories.map((sub) => ({
      id: sub.globalId,
      categoryId: category.globalId,
      title: sub.title[lang],
      order: sub.order,
    }));
  }

  async getSubCategoryById(id: string, lang: Language = 'en') {
    const subCategory = await this.subCategoryRepository.findOne({
      where: { globalId: id },
      relations: ['children', 'contents'],
    });

    if (!subCategory) {
      throw new NotFoundException({
        message: 'Subcategory not found',
      });
    }

    const children = await this.subCategoryRepository.find({
      where: { parentSubCategoryId: subCategory.id },
      order: { order: 'ASC' },
    });

    const contents = await this.contentRepository.find({
      where: { subCategoryId: subCategory.id },
    });

    return {
      id: subCategory.globalId,
      title: subCategory.title[lang],
      order: subCategory.order,
      children: children.map((child) => ({
        id: child.globalId,
        title: child.title[lang],
        order: child.order,
      })),
      contents: contents.map((content) => ({
        id: content.globalId,
        title: content.title[lang],
        type: content.type,
      })),
    };
  }

  // CONTENT METHODS

  async createContent(createContentDto: CreateContentDto) {
    const subCategory = await this.subCategoryRepository.findOne({
      where: { globalId: createContentDto.subCategoryId },
    });

    if (!subCategory) {
      throw new NotFoundException({
        message: 'Subcategory not found',
      });
    }

    // Validate video content
    if (createContentDto.type === 'video' && !createContentDto.externalUrl) {
      throw new BadRequestException({
        message: 'Video content requires an external URL',
      });
    }

    // Validate link content
    if (createContentDto.type === 'link' && !createContentDto.externalUrl) {
      throw new BadRequestException({
        message: 'Link content requires an external URL',
      });
    }

    const content = this.contentRepository.create({
      subCategoryId: subCategory.id,
      title: createContentDto.title,
      body: createContentDto.body,
      type: createContentDto.type,
      externalUrl: createContentDto.externalUrl,
    });

    const savedContent = await this.contentRepository.save(content);

    return {
      id: savedContent.globalId,
      subCategoryId: subCategory.globalId,
      title: savedContent.title,
      body: savedContent.body,
      type: savedContent.type,
      externalUrl: savedContent.externalUrl,
    };
  }

  async getContentById(id: string, lang: Language = 'en') {
    const content = await this.contentRepository.findOne({
      where: { globalId: id },
    });

    if (!content) {
      throw new NotFoundException({
        message: 'Content not available at the moment.',
      });
    }

    // Stub for internet check - in real implementation, this would check connectivity
    if (content.type === 'video') {
      // This is a placeholder for internet connectivity check
      // In real implementation, you might check if the client has connection
      // For now, we just return the video URL and let client handle it
    }

    return {
      id: content.globalId,
      title: content.title[lang],
      body: content.body[lang],
      type: content.type,
      externalUrl: content.externalUrl,
    };
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { globalId: id },
    });

    if (!category) {
      throw new NotFoundException({ message: 'Category not found' });
    }

    await this.categoryRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }

  async deleteSubCategory(id: string) {
    const subCategory = await this.subCategoryRepository.findOne({
      where: { globalId: id },
    });

    if (!subCategory) {
      throw new NotFoundException({ message: 'Subcategory not found' });
    }

    await this.subCategoryRepository.remove(subCategory);
    return { message: 'Subcategory deleted successfully' };
  }

  async deleteContent(id: string) {
    const content = await this.contentRepository.findOne({
      where: { globalId: id },
    });

    if (!content) {
      throw new NotFoundException({ message: 'Content not found' });
    }

    await this.contentRepository.remove(content);
    return { message: 'Content deleted successfully' };
  }
}
