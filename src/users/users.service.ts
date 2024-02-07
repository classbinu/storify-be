import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserMongoRepository } from './users.repository';
import { User } from './schema/user.schema';
import { StoragesService } from 'src/storages/storages.service';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserMongoRepository,
    private readonly storagesService: StoragesService,
  ) {}

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

  async viewOtherUserProfile(userId: string): Promise<User> {
    return this.userRepository.getOtherUserProfile(userId);
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
    avatar?: Express.Multer.File,
  ): Promise<User> {
    if (avatar) {
      const imageUrl = await this.uploadProfileImage(userId, avatar);
      updateUserInfo.avatar = imageUrl;
    }
    return this.userRepository.updateUserProfile(userId, updateUserInfo);
  }

  async uploadProfileImage(
    userId: string,
    avatar: Express.Multer.File,
  ): Promise<string> {
    const fileNameParts = avatar.originalname.split('.');
    if (fileNameParts.length < 2) {
      throw new Error('Invalid file format.');
    }
    const ext = fileNameParts.pop();
    const fileName = `${userId}.${ext}`;
    return this.storagesService.imageUploadToS3(fileName, avatar, ext);
  }

  async deleteUser(userId: string): Promise<any> {
    return this.userRepository.deleteUser(userId);
  }
}
