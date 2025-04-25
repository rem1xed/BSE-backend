// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.jwt;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // використовуй той самий секрет
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
