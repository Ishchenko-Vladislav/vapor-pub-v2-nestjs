import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import {
  FindOptionsSelect,
  FindOptionsSelectByString,
  Repository,
} from 'typeorm';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>, // @InjectRepository(SubscriptionEntity) // private readonly subscriptionRepository: Repository<SubscriptionEntity>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    console.log(createUserDto);

    const isExist = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    console.log('ss', isExist);
    if (isExist) throw new BadRequestException('Такой email уже сущетсвует');

    const hashPassword = await hash(createUserDto.password, 12);
    const user = await this.userRepository.save({
      email: createUserDto.email,
      password: hashPassword,
      userName: createUserDto.username,
    });
    const { password: pass, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async findOne(email: string) {
    return this.userRepository.findOne({
      where: { email },
      // relations: { chats: { chat: { participant: { user: true } } } },
    });
  }
  async findOneSelect(
    email: string,
    select?:
      | FindOptionsSelect<UserEntity>
      | FindOptionsSelectByString<UserEntity>,
  ) {
    return this.userRepository.findOne({ where: { email }, select });
  }

  async allUser() {
    return await this.userRepository.find();
  }
}
