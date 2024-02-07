import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateSocialUserDto } from './dto/create-social-user.dto';
import { BookMongoRepository } from 'src/books/books.repository';

@Injectable()
export class UserMongoRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly booksRepository: BookMongoRepository,
  ) {}

  async createUser(user: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userModel(user);
      newUser.nickname = newUser.userId;
      return await newUser.save();
    } catch (error) {
      Logger.error(`createUser 실패: ${error.message}`);
      throw new Error('유저 생성 실패했습니다. 다시 시도해주세요.');
    }
  }

  async createSocialUser(user: CreateSocialUserDto): Promise<User> {
    try {
      const newUser = new this.userModel({
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar,
        socialProvider: user.socialProvider,
      });
      return await newUser.save();
    } catch (error) {
      Logger.error(`createSocialUser 실패: ${error.message}`);
      throw new Error('소셜 유저 생성 실패했습니다. 다시 시도해주세요.');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const userId = new Types.ObjectId(id);
      return await this.userModel.findById(userId).exec();
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async findByUserId(userId: string): Promise<User> {
    try {
      return await this.userModel.findOne({ userId }).exec();
    } catch (error) {
      throw new Error(`Error finding user by userId: ${error.message}`);
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

  async getUserProfile(userId: string): Promise<User> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('name email avatar nickname introduction')
        .exec();
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      Logger.error(`getUserProfile 실패: ${error.message}`);
      throw new Error(`유저 프로필 불러오기 실패했습니다. 다시 시도해주세요.`);
    }
  }

  async getOtherUserProfile(userId: string): Promise<User> {
    try {
      const otherUserId = await this.findByUserId(userId);
      const otherUserProfile = await this.userModel
        .findById(otherUserId)
        .select('-_id -status -createdAt -password -refreshToken -email');
      if (!otherUserProfile) {
        throw new Error('User not found');
      }

      return otherUserProfile;
    } catch (error) {
      Logger.error(`getOtherUserProfile 실패: ${error.message}`);
      throw new Error(`유저 프로필 불러오기 실패했습니다. 다시 시도해주세요.`);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.email) {
        const existingUser = await this.userModel
          .findOne({ email: updateUserDto.email })
          .exec();
        if (existingUser && existingUser._id.toString() !== id) {
          throw new Error('이미 사용중인 이메일입니다.');
        }
      }

      if (updateUserDto.refreshToken === null) {
        delete updateUserDto.refreshToken;
      }

      const userId = new Types.ObjectId(id);
      return await this.userModel
        .findByIdAndUpdate(userId, updateUserDto, { new: true })
        .exec();
    } catch (error) {
      Logger.error(`updateUser 실패: ${error.message}`);
      throw new Error('유저 정보 업데이트 실패했습니다. 다시 시도해주세요.');
    }
  }

  async updateUserProfile(
    userId: string,
    updateUserInfo: UpdateUserProfileDto,
  ): Promise<User> {
    try {
      if (updateUserInfo.nickname) {
        const existingNickname = await this.userModel
          .findOne({ nickname: updateUserInfo.nickname })
          .exec();
        if (existingNickname && existingNickname._id.toString() !== userId) {
          throw new Error('이미 사용중인 닉네임입니다.');
        }
      }

      const user = await this.userModel
        .findByIdAndUpdate(userId, updateUserInfo, { new: true })
        .select('avatar nickname introduction')
        .exec();

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      Logger.error(`updateUserProfile 실패: ${error.message}`);
      throw new Error('유저 프로필 업데이트 실패했습니다. 다시 시도해주세요.');
    }
  }

  async deleteUser(id: string): Promise<any> {
    try {
      const userId = new Types.ObjectId(id);
      return await this.userModel.findByIdAndDelete(userId).exec();
    } catch (error) {
      Logger.error(`deleteUser 실패: ${error.message}`);
      throw new Error('유저 삭제 실패했습니다. 다시 시도해주세요.');
    }
  }

  async save(email: string, userId: string, password: string): Promise<User> {
    try {
      const newUser = new this.userModel({
        email,
        userId,
        password,
      });

      return await newUser.save();
    } catch (error) {
      throw new Error(`Error saving user: ${error.message}`);
    }
  }
}
