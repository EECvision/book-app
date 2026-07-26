import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ResponseMessage('Login successful') // The requested response matches Login response structure/message
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token refreshed')
  async refresh(@Body() dto: RefreshDto) {
    // Note: We use the payload's user ID extracted from a valid refresh token.
    // In a full implementation, you'd have a RefreshToken strategy.
    // For simplicity, we just pass the raw string and let AuthService verify it.
    // We decode the JWT to get the user ID without throwing if it's expired (to let refresh fail gracefully if needed, or we just verify it directly in service).
    const jwtSecret = 'super-secret-refresh-key';
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(dto.refreshToken, jwtSecret);
      return this.authService.refreshTokens(decoded.sub, dto.refreshToken);
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
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);
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
