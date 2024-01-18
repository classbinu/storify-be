import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Story, StoryDocument } from './schema/story.schema';
import { Model } from 'mongoose';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';

@Injectable()
export class StoryMongoRepository {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
  ) {}

  async createStory(createStoryDto: CreateStoryDto): Promise<Story> {
    const newStory = new this.storyModel(createStoryDto);
    return newStory.save();
  }

  async findAllStroy(): Promise<Story[]> {
    return this.storyModel.find().exec();
  }

  async findStoryById(id: string): Promise<Story> {
    return this.storyModel.findById(id).exec();
  }

  async updateStory(
    id: string,
    updateStoryDto: UpdateStoryDto,
  ): Promise<Story> {
    return this.storyModel
      .findByIdAndUpdate(id, updateStoryDto, { new: true })
      .exec();
  }

  async deleteStory(id: string): Promise<Story> {
    return this.storyModel.findByIdAndDelete(id).exec();
  }
}
