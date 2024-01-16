import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserMongoRepository } from './users.repository';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserMongoRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(email: string): Promise<User> {
    return this.userRepository.getUser(email);
  }

  async update(email: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userRepository.updateUser(email, updateUserDto);
  }

  async remove(email: string): Promise<any> {
    return this.userRepository.deleteUser(email);
  }
}
