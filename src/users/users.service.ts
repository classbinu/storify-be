import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserMongoRepository } from './users.repository';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserMongoRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: Types.ObjectId): Promise<User> {
    return this.userRepository.findById(id);
  }

  async updateUser(
    id: Types.ObjectId,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userRepository.updateUser(id, updateUserDto);
  }

  async deleteUser(id: Types.ObjectId): Promise<any> {
    return this.userRepository.deleteUser(id);
  }
}
