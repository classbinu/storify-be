import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Render, 
  Res,
} from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { UnauthorizedException } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.authService.signUp(createUserDto);
      return res.redirect('/auth/login');
    } catch (error) {
      // 회원 가입에 실패하면, 회원가입 페이지로 리디렉션하고 오류 메시지를 전달합니다.
      return res.render('signup', { messages: { signupError: error.message } });
    }
  }
  
  @Get('/signup')
  @Render('signup')
  getSignup() {
    return { message: 'Welcome to the signup page!' };
  }
  
  @Post('/login')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  @Get('/login')
  @Render('login')
  getLogin() {
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/check-login')
  @Render('check-login')
  async checkLogin(@Req() req) {
    const user = await this.authService.findUserById(req.user.id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  logout(@Req() req: any) {
    this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  refreshTokens(@Req() req: any) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}