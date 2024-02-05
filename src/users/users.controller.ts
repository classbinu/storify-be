import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from './schema/user.schema';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@Req() req): Promise<User> {
    const userId = req.user.sub;
    return this.usersService.getUserProfile(userId);
  }

  @Get('profile/:username')
  async viewOtherProfile(@Param('username') username: string): Promise<any> {
    return this.usersService.viewOtherUserProfile(username);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch('profile')
  async updateProfile(
    @Req() req,
    @Body() updateUserInfo: UpdateUserProfileDto,
  ): Promise<User> {
    const userId = req.user.sub;
    return this.usersService.updateUserProfile(userId, updateUserInfo);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch()
  updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    const userId = req.user.sub;
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete()
  deleteUser(@Req() req): Promise<any> {
    const userId = req.user.sub;
    return this.usersService.deleteUser(userId);
  }
}
