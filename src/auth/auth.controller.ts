import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { CreateUserDto, LoginUserDto, RegisterDto, UpdateUserDto } from './dto/';
import { User } from './entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    // Normal user registration
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    // Creation by admin
    @Auth(ValidRoles.admin)
    @Post('create')
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Auth(ValidRoles.admin)
    @Delete(':id')
    deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.authService.delete(id);
    }

    @Patch('update/:id')
    @Auth(ValidRoles.user)
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
        @Body() updateUserDto: UpdateUserDto) {
        return this.authService.update(id, user, updateUserDto);
    }

    @Get('check-auth-status')
    @Auth()
    checkAuthStatus(@GetUser() user: User) {
        return this.authService.checkAuthStatus(user);
    }
}
