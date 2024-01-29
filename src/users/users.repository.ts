import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserMongoRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(user: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userModel(user);
      return await newUser.save();
    } catch (error) {
      Logger.error(`createUser 실패: ${error.message}`);
      throw new Error('유저 생성 실패했습니다. 다시 시도해주세요.');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      return await this.userModel.findOne({ username }).exec();
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new Error(`Error fetching all users: ${error.message}`);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.refreshToken === null) {
        delete updateUserDto.refreshToken;
      }
      return await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();
    } catch (error) {
      Logger.error(`updateUser 실패: ${error.message}`);
      throw new Error('유저 정보 업데이트 실패했습니다. 다시 시도해주세요.');
    }
  }

  async deleteUser(id: string): Promise<any> {
    try {
      return await this.userModel.findByIdAndDelete(id).exec();
    } catch (error) {
      Logger.error(`deleteUser 실패: ${error.message}`);
      throw new Error('유저 삭제 실패했습니다. 다시 시도해주세요.');
    }
  }

  async save(email: string, username: string, password: string): Promise<User> {
    try {
      const newUser = new this.userModel({
        email,
        username,
        password,
      });

      return await newUser.save();
    } catch (error) {
      throw new Error(`Error saving user: ${error.message}`);
    }
  }
}
