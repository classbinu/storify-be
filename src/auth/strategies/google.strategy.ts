import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    const { id, name, photos } = profile;

    this.logger.verbose(JSON.stringify({ ...profile }));

    // Google로부터 받은 사용자 정보를 반환합니다.
    const userData = {
      userId: id,
      nickname: name.familyName + name.givenName,
      avatar: photos[0].value,
      socialProvider: 'google',
    };

    return done(null, userData);
  }
}
