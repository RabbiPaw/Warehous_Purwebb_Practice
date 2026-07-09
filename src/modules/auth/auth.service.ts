import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from '../../database/repositories/users.repository';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const defaultRoleId = await this.usersRepository.getDefaultRoleId();
    if (!defaultRoleId) {
      throw new Error('Default role "Unknown" not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      surname: dto.surname,
      patronymic: dto.patronymic || null,
      roleId: defaultRoleId,
      isActive: true,
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      accessToken: token,
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: 'Unknown',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmailWithRole(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersRepository.updateLastLogin(user.id);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      accessToken: token,
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.roleName,
    };
  }

  async getMe(userId: string) {
    const user = await this.usersRepository.findByIdWithRole(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}