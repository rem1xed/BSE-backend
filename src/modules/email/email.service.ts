import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
// import { mailTransport } from './mail/mail.transport';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private nodemailerTransport: Mail;
    
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {
        this.nodemailerTransport = createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: configService.get('EMAIL_USER'),
                pass: configService.get('EMAIL_PASSWORD')
            }
        });
    }

    private sendMail(options: Mail.Options) {
        this.logger.log('Email sent out to', options.to);
        return this.nodemailerTransport.sendMail(options);
    }
    
    public async decodeConfirmationToken(token: string) {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET')
            });

            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email;
            }
            throw new BadRequestException('Invalid token payload');
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException(
                    'Email confirmation token expired'
                );
            }
            throw new BadRequestException('Bad confirmation token');
        }
    }
    
    private generateResetCode(): string {
        // Generate a random 6-digit code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    public async sendResetPasswordCode(email: string): Promise<void> {
        const secret = this.configService.get('JWT_VERIFICATION_TOKEN_SECRET');
        const tokenExpirationTime = this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME') || '3600';
        
        if (!secret) {
            this.logger.error('JWT_VERIFICATION_TOKEN_SECRET is not defined');
            throw new Error('JWT token secret is not configured');
        }
        
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Для безпеки не розкриваємо інформацію про існування користувача
            this.logger.warn(`Reset password attempted for non-existent email: ${email}`);
            // Не кидаємо помилку, щоб не розкрити що користувач не існує
            return;
        }
        
        // Generate a 6-digit code
        const resetCode = this.generateResetCode();
        
        // Store code in user record
        user.resetToken = resetCode;
        user.resetTokenExpires = new Date(Date.now() + parseInt(tokenExpirationTime) * 1000);
        await user.save();
        
        // Calculate expiration in hours for display in email
        const expirationHours = Math.floor(parseInt(tokenExpirationTime) / 3600);
        
        // Create an HTML email template with code instead of link
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Code</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .wrapper {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                }
                .container {
                    padding: 20px;
                }
                .header {
                    background-color: #0066cc;
                    text-align: center;
                    padding: 20px;
                    color: white;
                }
                .content {
                    padding: 20px;
                }
                .reset-code {
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    letter-spacing: 5px;
                    color: #0066cc;
                    padding: 20px;
                    margin: 20px 0;
                    background-color: #f0f7ff;
                    border-radius: 4px;
                }
                .footer {
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 15px;
                    font-size: 12px;
                    color: #777;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 10px;
                }
                @media only screen and (max-width: 600px) {
                    .wrapper {
                        width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="header">
                    <h1>Password Reset</h1>
                </div>
                <div class="content">
                    <p>Hello ${user.firstName},</p>
                    <p>We received a request to reset your password for your account. If you didn't make this request, you can safely ignore this email.</p>
                    <p>To reset your password, use the following code:</p>
                    <div class="reset-code">${resetCode}</div>
                    <p>This code will expire in ${expirationHours} hour(s).</p>
                    <p>If you need further assistance, please contact our support team.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;
        
        this.logger.debug(`Reset code for ${email}: ${resetCode}`);
        
        // Додаємо обробку помилок для відправки пошти
        try {
            await this.sendMail({
                to: email,
                subject: 'Reset Your Password',
                text: `Hello ${user.firstName}, please use this code to reset your password: ${resetCode}. This code will expire in ${expirationHours} hour(s).`,
                html: htmlContent
            });
            this.logger.log(`Reset password code sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send reset password code to ${email}: ${error.message}`);
            // Логуємо помилку, але не перекидаємо її далі з міркувань безпеки
            // Це запобігає витоку інформації про існування акаунтів
        }
    }
}