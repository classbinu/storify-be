import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateAuthDto } from './dto/update-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  signin(@Body() data: AuthDto) {
    return this.authService.logIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('logout')
  logout(@Req() req: any) {
    this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Post('refresh')
  refreshTokens(@Req() req: any) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch('password')
  async changePassword(@Body() updateAuthDto: UpdateAuthDto, @Req() req: any) {
    return await this.authService.changePassword(
      req.user['sub'],
      updateAuthDto,
    );
  }
}
