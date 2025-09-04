import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    void this.createTransporter();
  }

  private async createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    // Verify connection configuration
    try {
      await this.transporter.verify();
      this.logger.log('SMTP server connection verified successfully');
    } catch (error) {
      this.logger.error('SMTP server connection failed:', error);
    }
  }

  async sendOtpEmail(
    email: string,
    otp: number,
    userName: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"MOMent App" <${this.configService.get<string>('SMTP_USER')}>`,
        to: email,
        subject: 'Your OTP Code - MOMent Verification',
        html: this.generateOtpEmailTemplate(userName, otp),
        text: `Hello ${userName}, Your OTP code for MOMent is: ${otp}. This code will expire in 10 minutes.`,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `OTP email sent successfully to ${email}. MessageId: ${result.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }

  private generateOtpEmailTemplate(userName: string, otp: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MOMent - OTP Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">MOMent</h1>
              <p style="color: #f0f0f0; margin: 5px 0 0 0; font-size: 16px;">Your Pregnancy Companion 🤱</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; text-align: center;">OTP Verification Required</h2>
              
              <p style="font-size: 16px;">Hello <strong>${userName}</strong>,</p>
              
              <p style="font-size: 16px;">You've requested access to your MOMent account. Please use the following verification code:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                  <div style="background: white; border: 3px solid #ff9a9e; padding: 25px; border-radius: 15px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                      <span style="font-size: 36px; font-weight: bold; color: #ff6b9d; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                  </div>
              </div>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404; font-weight: 500;">
                      <strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong> for your security.
                  </p>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                  If you didn't request this verification code, please ignore this email or contact our support team.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <div style="text-align: center; color: #666; font-size: 12px;">
                  <p style="margin: 5px 0;">This email was sent by MOMent App</p>
                  <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} MOMent. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }
}
