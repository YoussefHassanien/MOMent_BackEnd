import { BadRequestException, Injectable } from '@nestjs/common';
import CreateUserDto from './dtos/create-user.dto';
import { Role } from '../../constants/enums';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../../database/data-source';

@Injectable()
export class AuthService {
  constructor() {}
  private readonly rounds: number = 12;
  async create(user: CreateUserDto, role: Role) {
    if (user.password !== user.confirmPassword) {
      throw new BadRequestException('Passwords did not match');
    }

    const existingUser = await AppDataSource.manager.findOne(User, {
      where: [{ email: user.email }, { mobileNumber: user.mobileNumber }],
    });

    if (existingUser?.email === user.email) {
      throw new BadRequestException('This email already exists');
    }

    if (existingUser?.mobileNumber === user.mobileNumber) {
      throw new BadRequestException('This mobile number already exists');
    }

    const hashedPassword: string = await bcrypt.hash(
      user.password,
      this.rounds,
    );

    const newUser = new User();
    newUser.globalId = randomUUID();
    newUser.email = user.email;
    newUser.mobileNumber = user.mobileNumber;
    newUser.name = `${user.firstName} ${user.lastName}`;
    newUser.password = hashedPassword;
    newUser.role = role;
    newUser.language = user.language;

    const createdUser = await AppDataSource.manager.save(newUser);

    return createdUser;
  }
}
