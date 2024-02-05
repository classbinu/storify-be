import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
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

  async findById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  async getUserProfile(userId: string): Promise<User> {
    return this.userRepository.getUserProfile(userId);
  }

  async viewOtherUserProfile(username: string): Promise<User> {
    return this.userRepository.getOtherUserProfile(username);
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userRepository.updateUser(userId, updateUserDto);
  }

  async updateUserProfile(
    userId: string,
    updateUserInfo: UpdateUserProfileDto,
  ): Promise<User> {
    return this.userRepository.updateUserProfile(userId, updateUserInfo);
  }

  async deleteUser(userId: string): Promise<any> {
    return this.userRepository.deleteUser(userId);
  }
}
