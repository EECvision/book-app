import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'super-secret-jwt-key', // In production, use process.env.JWT_SECRET
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Token Version Strategy: Instantly invalidate tokens on logout
    if ((user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return user;
  }
}
