import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import * as streamifier from 'streamifier';

@Injectable()
export class StorageService {
  private isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
    
    if (this.isProduction) {
      cloudinary.config({
        cloudinary_url: this.configService.get('CLOUDINARY_URL'),
      });
    }
  }

  async uploadFile(file: Express.Multer.File, baseUrl: string): Promise<string> {
    if (this.isProduction) {
      // Cloudinary Upload
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'books' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url || '');
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } else {
      // Local Disk Upload
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'books');
      
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadPath = path.join(uploadDir, filename);
      
      await fs.promises.writeFile(uploadPath, file.buffer);
      return `${baseUrl}/uploads/books/${filename}`;
    }
  }
}
