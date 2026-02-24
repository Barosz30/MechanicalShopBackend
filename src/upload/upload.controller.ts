import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname);
        if (!allowed) {
          return cb(
            new Error('Dozwolone formaty: jpg, jpeg, png, gif, webp'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('Brak pliku. Wyślij pole "file".');
    }

    const result = await this.cloudinaryService.uploadImage(file);

    if ('error' in result) {
      throw new BadRequestException(result.error?.message ?? 'Błąd Cloudinary');
    }

    const response = result as UploadApiResponse;
    return {
      url: response.secure_url,
      publicId: response.public_id ?? '',
    };
  }
}
