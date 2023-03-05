import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto/';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {
    }

    async create(createUserDto: CreateUserDto): Promise<Object> {
        try {
            const { password, roles, ...userData } = createUserDto;
            const user = this.userRepository.create({
                ...userData,
                roles: roles.join(','),
                password: bcrypt.hashSync(password, 10),
            });
            await this.userRepository.save(user);
            delete user.password;
            return {
                ...user,
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async update(id: number, user: User, updateUserDto: UpdateUserDto): Promise<Object> {

        if (user.id !== id)
            throw new ForbiddenException();

        try {

            const { password, roles, ...userData } = updateUserDto;
            let rolesString: string;
            if (roles) {
                rolesString = roles.join(',');
            }

            const user = await this.userRepository.preload({
                id,
                ...userData,
                roles: rolesString,
                password: bcrypt.hashSync(password, 10),
            });
            await this.userRepository.save(user);

            delete user.password;
            return {
                ...user,
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            this.handleDBErrors(error);
        }
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

    private handleDBErrors(error: any): never {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new BadRequestException(error.sqlMessage);
        } else {
            console.log(error);
            throw new InternalServerErrorException('Error, check logs');
        }
    }
}
