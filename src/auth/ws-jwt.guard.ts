/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/auth/ws-jwt.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const authHeader =
      client.handshake?.auth?.token || client.handshake?.headers?.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token found');
    }

    // Extract token (remove "Bearer ")
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    try {
      const payload = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });

      // ✅ attach user payload for gateway access
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (client as any).user = payload;
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
