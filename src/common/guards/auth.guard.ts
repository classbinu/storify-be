// auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // 토큰 검증 실패 시 에러 처리
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    // 검증 성공 시 사용자 정보 반환
    return user;
  }
}
