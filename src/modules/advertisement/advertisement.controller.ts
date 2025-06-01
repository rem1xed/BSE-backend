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
}