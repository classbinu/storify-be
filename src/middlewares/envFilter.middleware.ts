import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class EnvFilterMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (
      req.method === 'GET' &&
      (req.path.includes('.env') || req.path.includes('admin'))
    ) {
      res.status(403).send('Forbidden');
    } else {
      next();
    }
  }
}
