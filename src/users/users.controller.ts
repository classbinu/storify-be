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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from './schema/user.schema';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { ApiTags, ApiBody, ApiProperty, ApiConsumes } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

class FileUploadDto extends UpdateUserProfileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: any;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  // 권한있어야 조회 가능하게 수정 필요
  // @Get()
  // findAll(): Promise<User[]> {
  //   return this.usersService.findAll();
  // }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@Req() req): Promise<User> {
    const userId = req.user.sub;
    return this.usersService.getUserProfile(userId);
  }

  @Get('profile/:userId')
  async viewOtherProfile(@Param('userId') userId: string): Promise<any> {
    return this.usersService.viewOtherUserProfile(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Patch('profile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User Profile and Avatar Data',
    type: FileUploadDto,
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 4000000 }, // 4MB
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async updateProfile(@Req() req, @UploadedFile() avatar): Promise<User> {
    const userId = req.user.sub;
    const updateUserInfo: UpdateUserProfileDto = req.body;
    return this.usersService.updateUserProfile(userId, updateUserInfo, avatar);
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
