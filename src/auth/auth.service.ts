import * as argon2 from 'argon2';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { AuthDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { FriendsMongoRepository } from 'src/friends/friends.repository';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { NotiService } from 'src/noti/noti.service';
import { Types } from 'mongoose';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/users/schema/user.schema';
import { UserMongoRepository } from 'src/users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userMongoRepository: UserMongoRepository,
    private readonly friendsMongoRrpository: FriendsMongoRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly notiService: NotiService,
  ) {}

  // 회원가입
  async register(createUserDto: CreateUserDto): Promise<any> {
    if (!createUserDto.userId) {
      throw new BadRequestException('아이디를 입력해 주세요.');
    }

    const userExists = await this.userMongoRepository.findByUserId(
      createUserDto.userId,
    );
    if (userExists) {
      throw new BadRequestException('존재하는 아이디입니다.');
    }

    // Hash password
    const newUser = await this.userMongoRepository.createUser(createUserDto);

    // 저장된 비밀번호 확인
    const savedUser = await this.userMongoRepository.findByUserId(
      newUser.userId,
    );
    console.log('Saved hashed password:', savedUser.password);
    const tokens = await this.getTokens(newUser._id);
    await this.updateRefreshToken(newUser._id, tokens.refreshToken);

    // Create friend DB for the new user
    await this.friendsMongoRrpository.createFriend({
      user: newUser._id,
      friends: [],
    });

    // 회원가입 이메일 발송
    // await this.mailService.sendWelcomeMail(newUser.email, newUser.userId);
    return tokens;
  }

  // 로그인
  async logIn(data: AuthDto) {
    // Check if user exists
    const user = await this.userMongoRepository.findByUserId(data.userId);
    if (!user) throw new BadRequestException('존재하지 않는 아이디입니다.');
    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new BadRequestException('비밀번호를 확인해 주세요.');
    const tokens = await this.getTokens(user._id);
    await this.updateRefreshToken(user._id, tokens.refreshToken);

    this.notiService.sendMissedNotifications(user._id.toString());

    return {
      ...tokens,
      userId: user.userId,
      nickname: user.nickname,
      id: user._id,
    };
  }

  async socialLogIn(userData: any) {
    let user = await this.userMongoRepository.findByUserId(userData.userId);
    if (!user) {
      user = await this.userMongoRepository.createSocialUser(userData);
      await this.friendsMongoRrpository.createFriend({
        user: user._id,
        friends: [],
      });
    }

    const tokens = await this.getTokens(user._id);
    await this.updateRefreshToken(user._id, tokens.refreshToken);

    const payload = {
      ...tokens,
      userNickname: user.nickname,
      id: user._id,
    };

    return payload;
  }

  async loginCheck(userObjectId: string) {
    const user = await this.userMongoRepository.findById(userObjectId);
    const tokens = await this.getTokens(user._id);
    return {
      ...tokens,
      userId: user.userId,
      nickname: user.nickname,
      id: user._id,
    };
  }

  async findUserById(id: string): Promise<User> {
    try {
      return await this.userMongoRepository.findById(id);
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async logout(id: Types.ObjectId) {
    return this.userMongoRepository.updateUser(id.toString(), {
      refreshToken: null,
    });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async changePassword(id: string, updateAuthDto: UpdateAuthDto) {
    const user = await this.userMongoRepository.findById(id);

    if (!user) {
      return { message: '존재하지 않는 아이디입니다.' };
    }

    const checkOldpassword = await argon2.verify(
      user.password,
      updateAuthDto.oldPassword,
    );
    if (!checkOldpassword) {
      return { message: '비밀번호를 확인해주세요.' };
    }

    const hashedPassword = await this.hashData(updateAuthDto.newPassword);
    await this.userMongoRepository.updateUser(id, {
      password: hashedPassword,
    });
    return { message: '비밀번호 변경 완료!' };
  }

  async updateRefreshToken(id: Types.ObjectId, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userMongoRepository.updateUser(id.toString(), {
      refreshToken: hashedRefreshToken,
    });
  }

  // async getTokens(id: Types.ObjectId, email: string) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.jwtService.signAsync(
  //       {
  //         sub: id,
  //         email,
  //       },
  //       {
  //         secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
  //         expiresIn: '1d',
  //       },
  //     ),
  //     this.jwtService.signAsync(
  //       {
  //         sub: id,
  //         email,
  //       },
  //       {
  //         secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
  //         expiresIn: '7d',
  //       },
  //     ),
  //   ]);

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  async getTokens(id: Types.ObjectId) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1d',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: id,
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
    const user = await this.userMongoRepository.findById(id.toString());
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

    // const tokens = await this.getTokens(user._id, user.email);
    const tokens = await this.getTokens(user._id);
    await this.updateRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await this.userMongoRepository.findByEmail(email);
    const userId = user.userId;
    if (!user) {
      throw new BadRequestException('존재하지 않는 아이디입니다.');
    }

    const token = await this.jwtService.signAsync(
      {
        sub: user._id,
      },
      {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
        expiresIn: '1d',
      },
    );

    await this.mailService.sendResetPasswordMail(email, userId, token);
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

  async verifyJwt(jwt: string): Promise<any> {
    return this.jwtService.verifyAsync(jwt);
  }
}
