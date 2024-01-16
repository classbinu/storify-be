import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Render, 
  Res,
  Patch,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateAuthDto } from './dto/update-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return await this.authService.register(createUserDto);
  }
  
  @Post('/login')
  signin(@Body() data: AuthDto) {
    return this.authService.logIn(data);
  }

  @Get('/login')
  @Render('login')
  getLogin() {
    return;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @Get('/logout')
  logout(@Req() req: any) {
    this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Get('/refresh')
  refreshTokens(@Req() req: any) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch('password')
  async changePassword(
    @Body() updateAuthDto: UpdateAuthDto,
    @Req() req: any,
  ) {
    return await this.authService.changePassword(
      req.user['sub'],
      updateAuthDto,
    );
  }
}

