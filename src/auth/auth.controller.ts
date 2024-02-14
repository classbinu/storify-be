import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Patch,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { RefreshTokenGuard } from 'src/auth/guards/refreshToken.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import { KakaoAuthGuard } from './guards/kakao.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdateAuthDto } from './dto/update-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  logIn(@Body() data: AuthDto) {
    return this.authService.logIn(data);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any) {
    const user = req.user;
    const result = await this.authService.socialLogIn(user);
    return result;
  }

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuth() {}

  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuthRedirect(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    const tokens = await this.authService.socialLogIn(user);

    req.session.user = user;
    req.session.user = tokens.userNickname;
    req.session.accessToken = tokens.accessToken;
    req.session.refreshToken = tokens.refreshToken;

    res.redirect(`${process.env.FRONT_URL}`);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('login-check')
  async loginCheck(@Req() req: any) {
    const userObjectId = req.user.sub;
    return this.authService.loginCheck(userObjectId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('logout')
  logout(@Req() req: any) {
    this.authService.logout(req.user.sub);
  }

  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Post('refresh')
  refreshTokens(@Req() req: any) {
    const userId = req.user.sub;
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch('password')
  async changePassword(@Body() updateAuthDto: UpdateAuthDto, @Req() req: any) {
    return await this.authService.changePassword(req.user.sub, updateAuthDto);
  }

  // 데코레이터 줄이는 리팩토링 필요, dto로 변경예정
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', format: 'email' } },
    },
  })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return await this.authService.resetPassword(token, password);
  }
}
