import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Constant } from 'src/commons/Constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Constant.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      phone: payload.phone,
      role: payload.role,
      branchId: payload.branchId,
    };
  }
}
