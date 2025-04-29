import * as nodemailer from 'nodemailer';
import * as stubTransport from 'nodemailer-stub-transport';

const isTest = process.env.NODE_ENV === 'test';

export const mailTransport = isTest
  ? nodemailer.createTransport(stubTransport())
  : nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: false,
      auth: {
        
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });