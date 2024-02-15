import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
  constructor() {
    super();
  }
  handleRequest<TUser = any>(err: any, user: any): TUser {
    // 에러
    if (err || !user) {
      throw err;
    }
    return user;
  }
}
