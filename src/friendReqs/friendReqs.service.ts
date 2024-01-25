import { Injectable } from '@nestjs/common';
import { CreateFriendReqDto } from './dto/create-friendReq.dto';
import { UpdateFriendReqDto } from './dto/update-friendReq.dto';
import { FriendMongoRepository } from './friendReqs.repository';
import { FriendReq } from './schema/friendReq.schema';

@Injectable()
export class FriendsService {
  constructor(private readonly friendMongoRepository: FriendMongoRepository) {}

  createFriendReq(createFriendDto: CreateFriendReqDto): Promise<FriendReq> {
    return this.friendMongoRepository.createFriendReq(createFriendDto);
  }

  findAll(): Promise<FriendReq[]> {
    return this.friendMongoRepository.findAll();
  }

  findOne(id: string): Promise<FriendReq> {
    return this.friendMongoRepository.findOne(id);
  }

  update(id: string, updateFriendDto: UpdateFriendReqDto): Promise<FriendReq> {
    return this.friendMongoRepository.update(id, updateFriendDto);
  }

  delete(id: string): Promise<FriendReq> {
    return this.friendMongoRepository.delete(id);
  }
}
