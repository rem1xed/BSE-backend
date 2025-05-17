  // src/modules/account/account.controller.ts
  import { Controller, Get, Put, Body, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
  import { AccountService } from './account.service';
  import { UpdateAccountDto } from './dto/update-account.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { User } from '../users/models/users.model';

  interface RequestWithUser {
    user: {
      userId: number;
      email: string;
    };
  }

  @ApiTags('account')
  @Controller('account')
  export class AccountController {
    constructor(private accountService: AccountService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Отримати інформацію про акаунт користувача' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успішно', type: User })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Користувач не авторизований' })
    async getAccount(@Req() req: RequestWithUser) {
      return this.accountService.getAccount(req.user.userId);
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Оновити дані акаунта користувача' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успішно оновлено', type: User })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Користувач не авторизований' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неправильні дані' })
    async updateAccount(@Req() req: RequestWithUser, @Body() updateAccountDto: UpdateAccountDto) {
      return this.accountService.updateAccount(req.user.userId, updateAccountDto);
    }

    @Get('check-auth')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Перевірити чи користувач авторизований' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Користувач авторизований' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Користувач не авторизований' })
    async checkAuth(@Req() req: RequestWithUser) {
      const isAuthorized = await this.accountService.checkAuthorization(req.user.userId);
      return { isAuthorized };
    }
  }
