import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersRepository } from '../../database/repositories/users.repository';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

function extractToken(request: FastifyRequest): string | null {
  const authHeader = request.headers['authorization'];
  if (!authHeader || Array.isArray(authHeader)) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1];
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: any }>();
    const token = extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });

      const user = await this.usersRepository.findByIdWithRole(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}