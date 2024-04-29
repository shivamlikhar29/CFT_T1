import { IsNotEmpty, IsString, IsEmail, Length } from "class-validator";

export class AuthDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    public email: string

    @IsNotEmpty()
    @IsString()
    @Length(6, 20, {message:"Password must be 3-20 characters"})
    public password: string
    
    public status: string
}