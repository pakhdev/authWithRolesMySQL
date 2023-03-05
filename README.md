<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

This is an authorization module for NestJS withTypeORM using MySQL. The module includes:

- Roles controller
- Pagination DTO
- DB errors handler
- `@GetUser` decorator for use only in protected routes, returns all user properties
- Basic CRUD for users
- Two methods for user creation:
    - One for registration (without roles property)
    - One for user creation by an admin (with roles options), only allowed with admin token
- User update method with the possibility of updating user roles, but only with admin token
- ConfigModule, docker-compose(MySQL server) file and `.env.template` with very basic options, needs to be replaced

## Installation

To install this authorization module with roles, you can choose from two options:

**Option A (Very fast):**

1. Copy the entire project file and configure it for your purposes.
2. Rename and configure the `.env.template` file.
3. Run the command:

   ```bash
   $ npm install
   ```

4. Import AuthModule to your app.module.ts and any other relevant modules.
5. Enjoy! :)

**Option B (Fast):**

1. Install NestJS and configure TypeORM module for MySQL connection.
2. Copy `src/auth` and `src/common` folders to your project.
3. Run the following commands to install dependencies:

   ```bash
   $ npm i bcrypt @nestjs/passport passport @nestjs/jwt passport-jwt
   $ npm i -D @types/bcrypt @types/passport-jwt
   ```

4. Import AuthModule to your app.module.ts and any other relevant modules.
5. Enjoy! :)

## Usage

The available roles can be found in `src/auth/enums/valid-roles.enum.ts`.

```typescript
// Route available for all registered users
// Option 1:
@Patch('update/:id')
@Auth(ValidRoles.user)
updateUser(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto
    ) { ... }

// Option 2: Without passing roles it's equal to passing ValidRoles.user.
@Patch('update/:id')
@Auth()
updateUser(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto
    ) { ... }

// Both examples demonstrate the use of the `@GetUser` decorator.
```

I hope this helps! Let me know if you have any questions.
