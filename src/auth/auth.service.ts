import {
  BadRequestException,
  Body,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public } from 'src/utils/constants';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { IJwtPayload } from './types/jwt.interface';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    console.log('here validate', email);
    const user = await this.userService.findOneSelect(email, [
      'id',
      'email',
      'isVerified',
      'password',
      'userName',
    ]);
    if (!user)
      throw new BadRequestException("User with this email don't exist");
    const matchPassword = await compare(password, user.password);
    if (!matchPassword) throw new BadRequestException('Password incorrect');
    const { password: pass, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: UserEntity, response: Response) {
    console.log('here login fn');
    const payload: IJwtPayload = { email: user.email, sub: user.id };
    const tokens = await this.getNewTokens(payload);
    return tokens;
  }
  async register(createUserDto: CreateUserDto, response: Response) {
    const user = await this.userService.create(createUserDto);
    const payload: IJwtPayload = { email: user.email, sub: user.id };
    const tokens = await this.getNewTokens(payload);
    return tokens;
  }

  async refreshToken(token: string, response: Response) {
    if (!token) throw new UnauthorizedException('token is missing');
    // if(!token) {
    //   console.log(response.)
    // }
    const decoded = await this.verifyRefreshJwtToken(token);
    const payload = { email: decoded.email, sub: decoded.sub };

    const isExist = await this.userService.findOne(payload.email);
    if (!isExist) return new UnauthorizedException();
    const tokens = await this.getNewTokens(payload);
    return tokens;
  }

  async status(email: string) {
    if (!email) return { status: false };
    const user = await this.userService.findOne(email);
    if (!user) return { status: false };
    return { status: true, id: user.id, userName: user.userName };
  }

  private async verifyRefreshJwtToken(token: string): Promise<IJwtPayload> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: await this.configService.get('JWT_REFRESH_SECRET'),
      });
      return decoded;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private async getNewTokens(payload: IJwtPayload) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: await this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: await this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
