import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('findOne/:email')
  findOne(@Param('email') email: string): Promise<User> {
    return this.usersService.findOne(email);
  }

  @UseGuards(AccessTokenGuard)
  @Put('update/:email')
  update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(email, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('delete/:email')
  remove(@Param('email') email: string): Promise<any> {
    return this.usersService.remove(email);
  }
}
