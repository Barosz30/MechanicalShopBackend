import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MulterModule.register({
      dest: undefined,
    }),
    CloudinaryModule,
  ],
  controllers: [UploadController],
})
export class UploadModule {}

