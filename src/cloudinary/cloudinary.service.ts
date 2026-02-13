import { Injectable, BadRequestException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'nest-items' },
        (error, result) => {
          if (error) {
            return reject(
              new BadRequestException(`Błąd Cloudinary: ${error.message}`),
            );
          }

          resolve(result as UploadApiResponse);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }
}
