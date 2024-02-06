import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(KakaoStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_REST_API_KEY'),
      callbackURL: configService.get<string>('KAKAO_REDIRECT_URI'),
      //   clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { data } = response;
      const { properties } = data;

      const nickname = properties.nickname;
      const avatar = properties.profile_image;

      // this.logger.verbose(JSON.stringify({ nickname, avatar }));

      const userData = {
        userId: data.id,
        nickname: nickname,
        avatar,
        socialProvider: 'kakao',
      };
      return done(null, userData);
    } catch (error) {
      this.logger.error('Error in validation:', error);
      return done(error);
    }
  }
}
