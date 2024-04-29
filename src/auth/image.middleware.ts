// file-size.middleware.ts

import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import * as path from 'path';
import { extname } from 'path';

@Injectable()
export class FileSizeMiddleware implements NestMiddleware {
  
    private upload = multer({
        limits: { fileSize: 1024 * 1024 }, // 1MB file size limit
        fileFilter: (req, file, callback) => {
          const fileExt = path.extname(file.originalname).toLowerCase();
          if (!['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
            // Reject if file format is not allowed
            throw new ForbiddenException("File format is not allowed")
          }
          // Accept the file if it passes all checks
          callback(null, true);
        },
      }).single('file');

  use(req: Request, res: Response, next: NextFunction) {
    this.upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file size exceeded limit)
        throw res.json({ message: "File size exceeded"});
      } else if (err) {
        // An unknown error occurred
        console.log("Error on Image Middleware");
      }
      // No error occurred, proceed to the next middleware
      next();
    });
  }
}
