import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  BadRequestException,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtUserGuard } from './guards/jwt-auth.guard';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './dto/Advertisement.dto';
import { multerConfig } from './config/multer.config';
import { File } from 'multer';

@Controller('advertisement')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @UseGuards(JwtUserGuard)
  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 8, multerConfig))
  async create(
    @UploadedFiles() files: File[],
    @Body() body: CreateAdvertisementDto,
    @Request() req: any
  ) {
    
    try {
      // Генерація URL для зображень
      const images = files?.map(file => {
        return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      }) || [];

      const advertisementData = {
        userId: req.user.id,
        ...body,
        images,
      };

      const advertisement = await this.advertisementService.create(advertisementData);
      
      return {
        success: true,
        data: advertisement,
        message: 'Оголошення створено успішно'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async show(@Param('id') id: number) {
    const response = await this.advertisementService.findById(id);
    return response;
  }

  @Get('/adsCount/:id')
  async adsCount(@Param('id', ParseIntPipe) id: number) {
    const data = await this.advertisementService.findAndCount(id);

    return data;
  }

  @Get()
  async getAdvertisements(
    @Query('category') category?: string,
    @Query('city') city?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sortField') sortField?: string,
    @Query('sortDirection') sortDirection: 'ASC' | 'DESC' = 'DESC',
  ) {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.advertisementService.findAllWithFilters({
      category,
      city,
      region,
      search,
      offset,
      limit,
      sortField,
      sortDirection,
    });

    return {
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalCount: count,
      data: rows,
    };
  }

}