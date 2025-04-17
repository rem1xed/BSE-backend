// import * as nodemailer from 'nodemailer';
// import { EmailService } from './email.service';
// import { EmailController } from './email.controller';
// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from '../users/users.service';
// import { UsersController } from '../users/users.controller';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';


// describe('EmailService', () => {
//   let service: EmailService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [ UsersService, ConfigService, JwtService],
//       controllers: [EmailController, UsersController]
//     }).compile();
//     nodemailer.createTestAccount((err, account) => {
//         // create reusable transporter object using the default SMTP transport
//         let transporter = nodemailer.createTransport({
//             host: 'smtp.ethereal.email',
//             port: 587,
//             secure: false, // true for 465, false for other ports
//             auth: {
//                 user: account.user, // generated ethereal user
//                 pass: account.pass  // generated ethereal password
//             }
//         });
//     });
//     service = module.get<EmailService>(EmailService);
//   });
  

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailController } from './email.controller';
import { UsersController } from '../users/users.controller';
import * as nodemailer from 'nodemailer';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        UsersService,
        ConfigService,
        JwtService,
        {
          provide: 'MAIL_TRANSPORTER', // assume EmailService uses this injection token
          useValue: transporter,
        },
      ],
      controllers: [EmailController, UsersController],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
