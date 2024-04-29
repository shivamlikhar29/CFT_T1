import { BadRequestException, Body, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {jwtSecret} from '../utils/constants'
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signup(dto: AuthDto, res: Response) {
    const { email, password } = dto;
    const foundUser = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (foundUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password)

    await this.prisma.user.create({
        data: {
          email,
          hashedPassword
        }
    })

    
    return res.send("Created")
  }

  async signin(dto: AuthDto, req: Request, res: Response) {
    const { email, password } = dto;
    const foundUser = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (!foundUser) {
      throw new BadRequestException('Wrong Credentials');
    }

    const isMatch = await this.comparePasswords({
      password,
      hashedPassword: foundUser.hashedPassword
    })
    
    if (!isMatch) {
      throw new BadRequestException('Wrong Credentials');
    }
    
    if(isMatch && foundUser.status === 'active') {

      const token = await this.signToken({
          id: foundUser.id,
          email: foundUser.email,
          status: foundUser.status,
      })

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1);
  
      if(!token) throw new ForbiddenException()
      
      res.cookie('token',token,{expires:expirationDate, httpOnly: true})
  
      return res.send({message:"Logged In Successfully"})

    }

    return res.send({message: "User Status is Not Active"})
  }

  async signout(req: Request, res: Response) {
    res.clearCookie('token')
    return res.send({message:"Logged Out Successfully"})
  }



  //HELPER FUNCTIONS

  async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds );
  }
  async comparePasswords(args : {password: string, hashedPassword: string}) {
    return await bcrypt.compare(args.password, args.hashedPassword);
  }

  async signToken(args : {id: string, email: string, status: string}) {
    const payload = args
    console.log(payload)
   return this.jwt.signAsync(payload,{secret:jwtSecret})
  }
}