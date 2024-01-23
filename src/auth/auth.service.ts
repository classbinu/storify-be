import * as argon2 from 'argon2';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/users/schema/user.schema';
import { UserMongoRepository } from 'src/users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userMongoRepository: UserMongoRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // 회원가입
  async register(createUserDto: CreateUserDto): Promise<any> {
    // Check if username and email exists
    if (!createUserDto.username) {
      throw new BadRequestException('username is required');
    }

    const userExists = await this.userMongoRepository.findByUsername(
      createUserDto.username,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password);
    console.log('Hashed password:', hash);
    const newUser = await this.userMongoRepository.createUser({
      ...createUserDto,
      password: hash,
    });

    // 저장된 비밀번호 확인
    const savedUser = await this.userMongoRepository.findByUsername(
      newUser.username,
    );
    console.log('Saved hashed password:', savedUser.password);
    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    // 회원가입 이메일 발송
    await this.mailService.sendWelcomeMail(newUser.email, newUser.username);
    return tokens;
  }

  // 로그인
  async logIn(data: AuthDto) {
    // Check if user exists
    const user = await this.userMongoRepository.findByUsername(data.username);
    if (!user) throw new BadRequestException('User does not exist');
    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      username: user.username,
      id: user.id,
    };
  }

  async findUserById(id: string): Promise<User> {
    try {
      return await this.userMongoRepository.findById(id);
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async logout(id: string) {
    return this.userMongoRepository.updateUser(id, { refreshToken: null });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async changePassword(id: string, updateAuthDto: UpdateAuthDto) {
    const user = await this.userMongoRepository.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const checkOldpassword = await argon2.verify(
      user.password,
      updateAuthDto.oldPassword,
    );
    if (!checkOldpassword) {
      throw new UnauthorizedException('현재 비밀번호가 맞지 않습니다.');
    }

    const hashedPassword = await this.hashData(updateAuthDto.newPassword);
    await this.userMongoRepository.updateUser(id, {
      password: hashedPassword,
    });
    return { message: 'Password changed successfully' };
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userMongoRepository.updateUser(id, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(id: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1d',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: id,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(id: string, refreshToken: string) {
    const user = await this.userMongoRepository.findById(id);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await this.userMongoRepository.findByEmail(email);
    const username = user.username;
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
        expiresIn: '1d',
      },
    );

    await this.mailService.sendResetPasswordMail(email, username, token);
    return { message: 'Reset password email sent' };
  }

  async resetPassword(token: string, password: string) {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_RESET_SECRET'),
    });

    const hashedPassword = await this.hashData(password);
    await this.userMongoRepository.updateUser(decoded.sub, {
      password: hashedPassword,
    });
    return { message: 'Password reset successfully' };
  }
}
