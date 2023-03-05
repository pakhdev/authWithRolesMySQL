import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        // Переданные аргументы в декоратор окажутся в data
        const req = ctx.switchToHttp().getRequest();
        const user = data ? req.user[data] : req.user;
        user.roles = user.roles.split(',');
        if (!user)
            throw new InternalServerErrorException('User not found(request)');
        return user;
        // То, что вернёт этот декоратор и окажется в декорируемой переменной
    },
);
