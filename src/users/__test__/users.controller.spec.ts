import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest
              .fn()
              .mockResolvedValue({ id: '1', userId: 'test', password: 'test' }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should return a user', async () => {
      const createUserDto: CreateUserDto = {
        userId: 'test',
        password: 'test',
      };
      expect(await controller.createUser(createUserDto)).toEqual({
        id: '1',
        userId: 'test',
        password: 'test',
      });
      expect(service.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });
});
