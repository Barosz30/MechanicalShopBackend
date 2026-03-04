import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  getHello(): string {
    const distPath = join(__dirname, '..', 'templates', 'index.html');
    const distSrcPath = join(__dirname, '..', 'src', 'templates', 'index.html');
    const srcPath = join(process.cwd(), 'src', 'templates', 'index.html');
    const path = existsSync(distPath)
      ? distPath
      : existsSync(distSrcPath)
        ? distSrcPath
        : srcPath;
    return readFileSync(path, 'utf-8');
  }
}
