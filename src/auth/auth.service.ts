import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto, LoginUserDto, RegisterDto, UpdateUserDto } from './dto/';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ValidRoles } from './enums/valid-roles.enum';
import { handleDBErrors } from '../common/helpers/handle-db-errors.helper';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {
    }

    // Create
    async register(registerDto: RegisterDto): Promise<Object> {
        const registerUser = {
            ...registerDto,
            roles: [ValidRoles.user],
        };
        return await this.create(registerUser);
    }

    async create(createUserDto: CreateUserDto): Promise<Object> {
        const { password, roles, ...userData } = createUserDto;
        const user = this.userRepository.create({
            ...userData,
            roles: roles.join(','),
            password: bcrypt.hashSync(password, 10),
        });

        try {
            const savedUser = await this.userRepository.save(user);
            delete savedUser.password;
            return {
                ...savedUser,
                token: this.getJwtToken({ id: savedUser.id }),
            };
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    // Read
    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user)
            throw new NotFoundException('User not found');
        return user;
    }

    async findAll(paginationDto: PaginationDto): Promise<User[]> {
        const { limit = 10, offset = 0 } = paginationDto;
        return await this.userRepository.find({
            take: limit,
            skip: offset,
        });
    }

    // Update
    async update(id: number, user: User, updateUserDto: UpdateUserDto): Promise<Object> {

        if (user.id !== id && !user.roles.includes(ValidRoles.admin))
            throw new ForbiddenException();

        if (updateUserDto.roles && !user.roles.includes(ValidRoles.admin))
            throw new ForbiddenException();

        try {
            const { password, roles, ...userData } = updateUserDto;
            const rolesString = roles ? roles.join(',') : undefined;
            const user = await this.userRepository.preload({
                id,
                ...userData,
                roles: rolesString,
                password: bcrypt.hashSync(password, 10),
            });

            if (!user)
                throw new NotFoundException('User not found');

            await this.userRepository.save(user);

            delete user.password;
            return {
                ...user,
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    // Delete
    async delete(id: number): Promise<void> {
        const user = await this.findById(id);
        await this.userRepository.remove(user);
    }

    async login(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true, password: true },
        });
        if (!user) {
            throw new UnauthorizedException('Credentials are not valid (email)');
        }
        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Credentials are not valid (password)');

        delete user.password;
        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        };
    }

    async checkAuthStatus(user: User) {
        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        };
    }

    private getJwtToken(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

}
