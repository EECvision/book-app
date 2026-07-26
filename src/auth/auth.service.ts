import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  private async hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  private async getTokens(userId: string, email: string, tokenVersion: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, tokenVersion },
        { secret: 'super-secret-jwt-key', expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: 'super-secret-refresh-key', expiresIn: '7d' },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.usersService.update(userId, { hashedRefreshToken: hash });
  }

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashData(dto.password);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      tokenVersion: 0,
    });

    const tokens = await this.getTokens(user.id, user.email, user.tokenVersion || 0);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    const { password, hashedRefreshToken, ...userWithoutSensitiveData } = user as any;
    return {
      user: userWithoutSensitiveData,
      tokens
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password as string);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.tokenVersion || 0);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    const { password, hashedRefreshToken, ...userWithoutSensitiveData } = user as any;
    return {
      user: userWithoutSensitiveData,
      tokens
    };
  }

  async logout(userId: string) {
    const user = await this.usersService.findById(userId);
    if (user) {
      await this.usersService.update(userId, { 
        hashedRefreshToken: null,
        tokenVersion: (user.tokenVersion || 0) + 1
      });
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const foundUser = await this.usersService.findById(userId);
    if (!foundUser) throw new UnauthorizedException('Access denied');
    
    const user = await this.usersService.findByEmail(foundUser.email);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const rtMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!rtMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.tokenVersion || 0);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    
    return { tokens: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn } };
  }
}
