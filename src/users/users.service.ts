import {
  Body,
  ForbiddenException,
  Get,
  Injectable,
  NotFoundException,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { extname } from 'path';
import * as uuid from "uuid";
import * as fs from "fs"
import * as path from "path";

interface FileParams {
  fileName : string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMyUser(id: string, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException();
    }
    // const decodedUser = req.user as {
    //   id: string;
    //   email: string;
    //   status: string;
    // };

    // if (user.status !== 'active') {
    //     throw new ForbiddenException('User Status is not active');
    // }

    // if (user.id !== decodedUser.id) {
    //   throw new ForbiddenException("User ID is not valid");
    // }

    delete user.hashedPassword;

    return { user };
  }

  async getUsers(req: Request) {
    
    // const decodedUser = req.user as {
    //   id: string;
    //   email: string;
    //   status: string;
    // };

    // const foundUser = await this.prisma.user.findUnique({
    //   where: { email: decodedUser.email },
    // });

    // if (foundUser.status == 'null') {
    //     throw new ForbiddenException('User Status is not active');
    // } 

    return await this.prisma.user.findMany({
      select: { id: true, email: true, status: true },
    });
  }



  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const ext = extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        // Reject the file if the extension is not allowed
        callback(new ForbiddenException('Only image files (jpg, jpeg, png, gif) are allowed'), false);
      } else {
        // Accept the file if the extension is allowed
        callback(null, true);
      }
    },
    storage: null // Use MemoryStorage for temporary storage
  }))
  async profileUpload(req: Request, @UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      // Check file size
      if (file.size > 15 * 1024 * 1024) {
        throw new ForbiddenException('File size exceeds the limit (15MB)');
      }

      // Save the file to disk
      const uniqueFileName = `${uuid.v4()}${extname(file.originalname)}`;
      const filePath = `./uploads/${uniqueFileName}`;
      fs.writeFileSync(filePath, file.buffer);


      // STORING FILE IN DATABASE
      const decodedUser = req.user as {
        id: string;
        email: string;
        status: string;
      };
  
      const foundUser = await this.prisma.user.findUnique({
        where: { email: decodedUser.email },
      });

      const updatedUser = await this.prisma.user.update({
        where: { email: decodedUser.email }, // Filter based on the user's email
        data: { profile: uniqueFileName }, // Update the profile column with the image path
      });


      console.log("Original File Name:", file.originalname);
      console.log("Uploaded File Name:", uniqueFileName); // Unique file name
      return "success";
    } catch (error) {
      throw error;
    }
  }



// @Get('profile')
//   async getProfile(@Res() res : Response , @Body() file : FileParams)
//   {
//     // const imageUrl = `http://localhost:3000/uploads/${file.fileName}`
//     // console.log(imageUrl)
//     // res.sendFile(path.join(process.env.PWD,"uploads" ,  file.fileName));
//   }
  
async getProfile(@Req() req : Request, @Res() res : Response , @Body() file : FileParams): Promise<void> {
  try {
    // const { id } = this.jwtService.verify(token);

    req.user

    const decodedUser = req.user as {
      id: string;
      email: string;
      status: string;
    };

    const foundUser = await this.prisma.user.findUnique({
      where: { email: decodedUser.email },
    });

    // console.log(foundUser)

    // if (!foundUser || !foundUser.profile) {
    //   throw new NotFoundException('User profile image not found');
    // }

    // const filePath = path.join(__dirname, 'uploads', foundUser.profile);
    // if (!fs.existsSync(filePath)) {
    //   throw new NotFoundException('User profile image not found XXX');
    // }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${foundUser.profile}`;
    console.log("THis is imageUrl in getProfileImage", imageUrl);
    const responseData = {
      imageUrl,
    };
    
    res.json(responseData);
  } catch (error) {
    throw error;
  }
}

  async x(){
    return "hello from X"
  }
}
