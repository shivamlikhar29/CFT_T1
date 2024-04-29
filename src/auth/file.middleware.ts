// import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { extname } from 'path';

// @Injectable()
// export class FileInterceptorWithSize implements NestInterceptor {
//   private readonly fileInterceptor: FilesInter

//   constructor() {
//     this.fileInterceptor = FileInterceptor('file', {
//       storage: null, // Use MemoryStorage for temporary storage
//     });
//   }

//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const req = context.switchToHttp().getRequest();
//     const file: Express.Multer.File = req.file;

//     if (!file) {
//       throw new ForbiddenException('No file uploaded');
//     }

//     const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
//     const ext = extname(file.originalname).toLowerCase();
//     if (!allowedExtensions.includes(ext)) {
//       throw new ForbiddenException('Only image files (jpg, jpeg, png, gif) are allowed');
//     }

//     const maxSizeInBytes = 15 * 1024 * 1024; // 15 MB
//     if (file.size > maxSizeInBytes) {
//       throw new ForbiddenException('File size exceeds the limit (15MB)');
//     }

//     return this.fileInterceptor.intercept(context, next);
//   }
// }
