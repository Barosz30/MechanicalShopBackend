import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    if (!file) {
      throw new BadRequestException('Brak pliku do przesłania (pole "image").');
    }

    const result = await this.cloudinaryService.uploadImage(file);

    if (!('secure_url' in result) || !result.secure_url) {
      throw new BadRequestException('Nie udało się pozyskać adresu URL obrazu.');
    }

    return { imageUrl: result.secure_url };
  }
}

