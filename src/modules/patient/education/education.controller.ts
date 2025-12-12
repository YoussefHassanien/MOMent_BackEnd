import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { EducationService } from './education.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { CreateContentDto } from './dto/create-content.dto';

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  // CATEGORY ENDPOINTS

  @Post('categories')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.educationService.createCategory(createCategoryDto);
  }

  @Get('categories')
  async getAllCategories(@Query('lang') lang?: 'en' | 'ar') {
    return await this.educationService.getAllCategories(lang || 'en');
  }

  @Get('categories/:id')
  async getCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang?: 'en' | 'ar',
  ) {
    return await this.educationService.getCategoryById(id, lang || 'en');
  }

  @Get('categories/:id/subcategories')
  async getSubCategoriesByCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang?: 'en' | 'ar',
  ) {
    return await this.educationService.getSubCategoriesByCategory(
      id,
      lang || 'en',
    );
  }

  @Delete('categories/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return await this.educationService.deleteCategory(id);
  }

  // SUBCATEGORY ENDPOINTS

  @Post('subcategories')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  async createSubCategory(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return await this.educationService.createSubCategory(createSubCategoryDto);
  }

  @Get('subcategories/:id')
  async getSubCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang?: 'en' | 'ar',
  ) {
    return await this.educationService.getSubCategoryById(id, lang || 'en');
  }

  @Delete('subcategories/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  async deleteSubCategory(@Param('id', ParseUUIDPipe) id: string) {
    return await this.educationService.deleteSubCategory(id);
  }

  // CONTENT ENDPOINTS

  @Post('content')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  async createContent(@Body() createContentDto: CreateContentDto) {
    return await this.educationService.createContent(createContentDto);
  }

  @Get('content/:id')
  async getContentById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang?: 'en' | 'ar',
  ) {
    return await this.educationService.getContentById(id, lang || 'en');
  }

  @Delete('content/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(Role.ADMIN)
  async deleteContent(@Param('id', ParseUUIDPipe) id: string) {
    return await this.educationService.deleteContent(id);
  }
}
