import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public } from 'src/utils/constants';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthenticatedRequest } from './types/user.request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: { user: UserEntity },
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('req.user', req.user);
    return this.authService.login(req.user, response);
  }

  @Post('register')
  @Public()
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(createUserDto, response);
  }

  @Post('v1/secret/refresh')
  @Public()
  refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() payload: { refresh_token: string },
  ) {
    // console.log('I TRY GET TOKEN', payload.refresh_token);
    return this.authService.refreshToken(payload.refresh_token, response);
  }

  @Get('status')
  status(@Req() req: AuthenticatedRequest) {
    return this.authService.status(req.user.email);
  }
}
