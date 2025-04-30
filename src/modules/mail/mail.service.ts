// src/modules/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h1>Відновлення пароля</h1>
        <p>Доброго дня!</p>
        <p>Ви отримали цей лист, тому що запросили скидання пароля для вашого облікового запису.</p>
        <p>Ваш код для скидання пароля:</p>
        <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${code}</div>
        <p>Цей код дійсний протягом 30 хвилин.</p>
        <p>Якщо ви не запитували скидання пароля, проігноруйте цей лист.</p>
        <div style="margin-top: 30px; font-size: 12px; color: #777;">
          <p>З повагою,<br>Команда підтримки</p>
        </div>
      </div>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Скидання пароля',
        html: htmlContent, // Відправляємо HTML напряму, без шаблону
      });
      console.log(`Email з кодом відновлення надіслано на ${email}`);
    } catch (error) {
      console.error('Помилка відправки email:', error);
      throw error;
    }
  }
}