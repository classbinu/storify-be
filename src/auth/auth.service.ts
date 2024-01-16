import { BadRequestException, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/schema/user.schema';
import { UserMongoRepository } from 'src/users/users.repository';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userMongoRepository: UserMongoRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  
  // 회원가입
  async register(createUserDto: CreateUserDto): Promise<any> {
    // Check if username and email exists
    if (!createUserDto.username) {
      throw new BadRequestException('username is required');
    }

    const userExists = await this.userMongoRepository.findByUsername(createUserDto.username);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password);
    console.log("Hashed password:", hash);
    const newUser = await this.userMongoRepository.createUser({
      ...createUserDto,
      password: hash,
    });

    // 저장된 비밀번호 확인
    const savedUser = await this.userMongoRepository.findByUsername(newUser.username);
    console.log("Saved hashed password:", savedUser.password);
    const tokens = await this.getTokens(newUser._id, newUser.email);
    await this.updateRefreshToken(newUser._id, tokens.refreshToken);
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
    const tokens = await this.getTokens(user._id, user.email);
    await this.updateRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  async findUserById(userId: string): Promise<User> {
    try {
      return await this.userMongoRepository.getUser(userId);
    } catch(error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

	async logout(userId: string) {
    return this.userMongoRepository.updateUser(userId, { refreshToken: null });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async changePassword(userId: string, updateAuthDto: UpdateAuthDto) {
    const user = await this.userMongoRepository.getUser(userId);
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
    await this.userMongoRepository.updateUser(userId, { password: hashedPassword });
    return { message: 'Password changed successfully' };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userMongoRepository.updateUser(userId, {
    refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync({
      sub: userId,
      email,
      },
      {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
      },
    ),
    this.jwtService.signAsync({
      sub: userId,
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

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userMongoRepository.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user._id, user.email);
    await this.updateRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }
}
