import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './../src/modules/auth/auth.service';
import { UsersService } from './../src/modules/users/users.service';
import { EmailService } from './../src/modules/email/email.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});





describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let emailService: EmailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        EmailService,
        JwtService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should trigger email sending when email exists', async () => {
    // Mocking the user to simulate the existing email
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
      id: 1,
      email: 'ivan.petrenko@example.com',
      password: 'hashedPassword',
      resetToken: null,
      firstName: 'Ivan',  
      lastName: 'Petrenko',
      phone: '1234567890',
      bonuses: 0,
    } as any);

    // Mocking the email sending method
    jest.spyOn(emailService, 'sendResetPasswordLink').mockResolvedValue(undefined);

    // Call the method to test
    await authService.forgotPassword('ivan.petrenko@example.com');

    // Assertions
    expect(usersService.findByEmail).toHaveBeenCalledWith('ivan.petrenko@example.com');
    expect(emailService.sendResetPasswordLink).toHaveBeenCalledWith('ivan.petrenko@example.com');
  });
});