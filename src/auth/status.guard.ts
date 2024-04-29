import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'prisma/prisma.service';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken'
import { jwtSecret } from 'src/utils/constants';

@Injectable()
export class StatusGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.token

    const decoded = jwt.verify(token,jwtSecret); // Replace 'your_secret_key' with your actual secret key
    const decodedUser = decoded as {
      id: string;
      email: string;
      status: string;
    };

    const foundUser = await this.prisma.user.findUnique({
      where: { email: decodedUser.email },
    });

    // console.log(foundUser);
    console.log("Image Status Guard")

    if (foundUser.status !== 'active') {
          throw new ForbiddenException('User Status is not active');
      }

    return true;
  }
}