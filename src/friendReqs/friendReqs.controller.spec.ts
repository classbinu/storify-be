import { Test, TestingModule } from '@nestjs/testing';
import { FriendReqsController } from './friendReqs.controller';
import { FriendReqsService } from './friendReqs.service';

describe('FriendsController', () => {
  let controller: FriendReqsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendReqsController],
      providers: [FriendReqsService],
    }).compile();

    controller = module.get<FriendReqsController>(FriendReqsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
