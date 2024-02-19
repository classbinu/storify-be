import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let mockCreateUser: Partial<UsersService>;

  beforeEach(async () => {
    mockCreateUser = {
      createUser: jest
        .fn()
        .mockResolvedValue({ id: '1', userId: 'test', password: 'test' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockCreateUser,
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

  describe('getProfile', () => {
    it('should return a user profile', async () => {
      const req = { user: { sub: '1' } };
      jest
        .spyOn(service, 'getUserProfile')
        .mockResolvedValue({ id: '1', userId: 'test', password: 'test' });

      expect(await controller.getProfile(req)).toEqual({
        id: '1',
        userId: 'test',
        password: 'test',
      });
      expect(service.getUserProfile).toHaveBeenCalledWith(req.user.sub);
    });
  });

  describe('viewOtherProfile', () => {
    it('should return other user profile', async () => {
      const userId = '2';
      jest
        .spyOn(service, 'viewOtherUserProfile')
        .mockResolvedValue({ id: '2', userId: 'test2', password: 'test2' });

      expect(await controller.viewOtherProfile(userId)).toEqual({
        id: '2',
        userId: 'test2',
        password: 'test2',
      });
      expect(service.viewOtherUserProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateProfile', () => {
    it('should return an error when avatar, nickname, and introduction are empty', async () => {
      const req = {
        user: { sub: '1' },
        body: { avatar: '', nickname: '', introduction: '' },
      };
      const avatar = 'avatar.png';
      jest.spyOn(service, 'updateUserProfile').mockImplementation(() => {
        throw new Error(
          'avatar, nickname, and introduction should not be empty',
        );
      });

      try {
        await controller.updateProfile(req, avatar);
      } catch (e) {
        expect(e.message).toEqual(
          'avatar, nickname, and introduction should not be empty',
        );
      }
      expect(service.updateUserProfile).toHaveBeenCalledWith(
        req.user.sub,
        req.body,
        avatar,
      );
    });
  });

  describe('updateUser', () => {
    it('should return an error when password, email, and refreshToken are empty', async () => {
      const req = { user: { sub: '1' } };
      const updateUserDto = { password: '', email: '', refreshToken: '' };
      jest.spyOn(service, 'updateUser').mockImplementation(() => {
        throw new Error(
          'password, email, and refreshToken should not be empty',
        );
      });

      try {
        await controller.updateUser(req, updateUserDto);
      } catch (e) {
        expect(e.message).toEqual(
          'password, email, and refreshToken should not be empty',
        );
      }
      expect(service.updateUser).toHaveBeenCalledWith(
        req.user.sub,
        updateUserDto,
      );
    });
  });

  describe('findById', () => {
    it('should find and return a user', async () => {
      const id = '1';
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue({ id: '1', userId: 'test', password: 'test' });

      expect(await controller.findById(id)).toEqual({
        id: '1',
        userId: 'test',
        password: 'test',
      });
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const req = { user: { sub: '1' } };
      jest.spyOn(service, 'deleteUser').mockResolvedValue({ deleted: true });

      expect(await controller.deleteUser(req)).toEqual({ deleted: true });
      expect(service.deleteUser).toHaveBeenCalledWith(req.user.sub);
    });
  });
});
