import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { join } from 'path';
import * as fs from 'fs';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

@Controller('admin/upload')
export class UploadController {
  @Post('image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
          return cb(new BadRequestException('仅支持上传 png/jpg/jpeg/webp 图片'), false);
        }
        return cb(null, true);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads');
          fs.mkdir(uploadDir, { recursive: true }, (err) => cb(err, uploadDir));
        },
        filename: (_req, file, cb) => {
          const ext = EXT_BY_MIME[file.mimetype] || 'bin';
          cb(null, `${randomUUID()}.${ext}`);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file?: { filename?: string }) {
    if (!file?.filename) {
      throw new BadRequestException('未找到上传文件字段 file');
    }
    return {
      url: `/uploads/${file.filename}`,
    };
  }
}
