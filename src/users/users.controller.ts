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
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from './schema/user.schema';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { ApiTags } from '@nestjs/swagger';

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

  @Get(':id')
  findById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async getProfile(@Req() req): Promise<User> {
    const userId = req.user.sub;
    return this.usersService.getUserProfile(userId);
  }

  @Get('profile/:id')
  async viewOtherProfile(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('size') size: number,
  ): Promise<any> {
    return this.usersService.viewOtherUserProfile(userId, page, size);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req,
    @Body() updateUserInfo: UpdateUserProfileDto,
  ): Promise<User> {
    const userId = req.user.sub;
    return this.usersService.updateUserProfile(userId, updateUserInfo);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<any> {
    return this.usersService.deleteUser(id);
  }
}
