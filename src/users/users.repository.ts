import { Injectable } from '@nestjs/common';
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
    } catch(error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async getUser(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch(error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.refreshToken === null) {
        delete updateUserDto.refreshToken;
      }
      return await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    } catch(error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }


  async deleteUser(email: string): Promise<any> {
    try {
      return await this.userModel.deleteOne({ email }).exec();
    } catch(error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch(error) {
      throw new Error(`Error finding user by email: ${error.message}`);
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
    } catch(error) {
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch(error) {
      throw new Error(`Error fetching all users: ${error.message}`);
    }
  }
}
