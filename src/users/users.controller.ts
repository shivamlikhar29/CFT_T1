import { Body, Controller, ForbiddenException, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { StatusGuard } from 'src/auth/status.guard';

interface FileParams {
  fileName : string;
}


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthGuard,StatusGuard)
  
  @Get('profile')
  getProfile(@Req() req, @Res() res, @Body() file: FileParams){
    return this.usersService.getProfile(req,res, file)
  }
  @Get('x')
    x(){
      return this.usersService.x()
    }
  
  @UseGuards(JwtAuthGuard,StatusGuard)
  @Get(':id')
  getMyUser(@Param() params: {id: string}, @Req() req){
    return this.usersService.getMyUser(params.id, req)
  }
  @UseGuards(JwtAuthGuard, StatusGuard)
  @Get()
  getUsers(@Req() req){
    return this.usersService.getUsers(req)
  }

  @UseGuards(JwtAuthGuard, StatusGuard)
  @Post('profile')
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
  profileUpload(@Req() req,@UploadedFile() file: Express.Multer.File){
    return this.usersService.profileUpload(req,file)
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(StatusGuard)

}
