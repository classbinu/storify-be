import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friendReqs.controller';
import { FriendsService } from './friendReqs.service';

describe('FriendsController', () => {
  let controller: FriendsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [FriendsService],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
