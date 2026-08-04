import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, UseGuards, Res, Headers } from '@nestjs/common';
import type { Response, CookieOptions } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
});

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ResponseMessage('Login successful') // The requested response matches Login response structure/message
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-auth-method') authMethod: string,
  ) {
    const result = await this.authService.register(dto);
    if (authMethod === 'cookie') {
      res.cookie('accessToken', result.tokens.accessToken, getCookieOptions());
      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());
      return { user: result.user };
    }
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-auth-method') authMethod: string,
  ) {
    const result = await this.authService.login(dto);
    if (authMethod === 'cookie') {
      res.cookie('accessToken', result.tokens.accessToken, getCookieOptions());
      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());
      return { user: result.user };
    }
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token refreshed')
  async refresh(
    @Req() req: any,
    @Body() dto: RefreshDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-auth-method') authMethod: string,
  ) {
    const refreshToken = authMethod === 'cookie' ? req.cookies?.refreshToken : dto.refreshToken;
    if (!refreshToken) {
      const { UnauthorizedException } = require('@nestjs/common');
      throw new UnauthorizedException('Refresh token missing');
    }

    const jwtSecret = 'super-secret-refresh-key';
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(refreshToken, jwtSecret);
      const result = await this.authService.refreshTokens(decoded.sub, refreshToken);
      if (authMethod === 'cookie') {
        res.cookie('accessToken', result.tokens.accessToken, getCookieOptions());
        return { success: true };
      }
      return result;
    } catch (e) {
      // If refresh token is expired, we can throw standard error
      const { UnauthorizedException } = require('@nestjs/common');
      throw new UnauthorizedException('Access denied');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged out successfully')
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-auth-method') authMethod: string,
  ) {
    await this.authService.logout(req.user.id);
    if (authMethod === 'cookie') {
      res.clearCookie('accessToken', getCookieOptions());
      res.clearCookie('refreshToken', getCookieOptions());
    }
    return null;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ResponseMessage('Profile fetched successfully')
  getProfile(@Req() req: any) {
    // req.user contains the user fetched and validated by JwtStrategy
    const { password, hashedRefreshToken, ...userProfile } = req.user;
    return { user: userProfile };
  }
}
