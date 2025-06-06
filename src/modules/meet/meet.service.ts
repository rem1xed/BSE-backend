import { Injectable, Logger, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticate } from '@google-cloud/local-auth';
import { google, Auth } from 'googleapis';
import {
  OAuth2Client,
  UserRefreshClient,
  GoogleAuth,
  AuthClient,
  auth,
} from 'google-auth-library';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IMeetingResponse } from './meet.interface';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MeetService {
  private readonly logger = new Logger(MeetService.name);
  private readonly SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar'
];
  private readonly TOKEN_PATH: string;
  private readonly CREDENTIALS_PATH: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly userService: UsersService) {
    this.TOKEN_PATH = path.join(process.cwd(), 'token.json');
    this.CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
  }

  async createMeetingForUsers(
    user1Id: number,
    user2Id: number,
    AdLink: string
  ): Promise<IMeetingResponse> {
    try {
      const authClient = await this.authorize();

      if (!authClient) {
        throw new Error('Failed to authorize with Google');
      }
      const meetUrl = await this.createSpace(authClient);

      const user1 = await this.userService.findById(user1Id);
      const user2 = await this.userService.findById(user2Id);

      const mailResponse = await this.mailService.sendMeetForm(user1?.firstName+' '+user1?.lastName, AdLink, meetUrl, user2?.email);
      
      return {
        meetingUri: meetUrl,
        status: 'created',
      };
    } catch (error) {
      this.logger.error('Failed to create meeting:', error);
      return {
        meetingUri: '',
        status: 'failed',
        error: error.message,
      };
    }
  }

  private async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
    try {
      const content = await fs.readFile(this.TOKEN_PATH, 'utf-8');
      const credentials = JSON.parse(content);
      
      const client = new OAuth2Client(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris ? credentials.redirect_uris[0] : undefined,
      );

      client.setCredentials({
        refresh_token: credentials.refresh_token,
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date
      });

      return client;
    } catch (err) {
      return null;
    }
  }

  private async saveCredentials(client: OAuth2Client): Promise<void> {
    try {
      const content = await fs.readFile(this.CREDENTIALS_PATH, 'utf-8');
      const keys = JSON.parse(content);
      const key = keys.installed || keys.web;

      const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
      });
      await fs.writeFile(this.TOKEN_PATH, payload);
    } catch (error) {
      this.logger.error('Failed to save credentials:', error);
      throw error;
    }
  }

  private async authorize(): Promise<OAuth2Client | null> {
    try {
      let client = await this.loadSavedCredentialsIfExist();
      if (client) {
        // Add debug logging to verify credentials
        this.logger.debug('Loaded credentials:', {
          hasRefreshToken: !!client.credentials.refresh_token,
          hasAccessToken: !!client.credentials.access_token,
        });
        return client;
      }

      this.logger.log('No saved credentials, starting OAuth flow...');
      const auth = await authenticate({
        scopes: this.SCOPES,
        keyfilePath: this.CREDENTIALS_PATH,

      });

      if (!auth?.credentials?.refresh_token) {
        throw new Error('No refresh_token received from OAuth flow!');
      }

      const content = await fs.readFile(this.CREDENTIALS_PATH, 'utf-8');
      const keys = JSON.parse(content);
      const key = keys.installed || keys.web;

      client = new OAuth2Client(
        key.client_id,
        key.client_secret,
        key.redirect_uris ? key.redirect_uris[0] : undefined,
      );

      // Set both refresh_token and access_token
      client.setCredentials({
        refresh_token: auth.credentials.refresh_token,
        access_token: auth.credentials.access_token,
        expiry_date: auth.credentials.expiry_date,
      });

      // Save credentials for future use
      await this.saveCredentials(client);

      return client;
    } catch (error) {
      this.logger.error('Authorization failed:', error);
      throw error; // Changed from return null to throw
    }
  }

  private async createSpace(authClient: OAuth2Client): Promise<string> {
    try {
      // Force token refresh if needed
      const isTokenExpired =
        authClient.credentials.expiry_date
          ? authClient.credentials.expiry_date < Date.now()
          : true;

      if (isTokenExpired) {
        this.logger.debug('Token expired, refreshing...');
        await authClient.getAccessToken();
      }

      const meet = google.meet({
        version: 'v2',
        auth: authClient,
      });

      const response = await meet.spaces.create({});

      if (!response?.data?.meetingUri) {
        throw new Error('No meeting URI received from Google Meet API');
      }

      return response.data.meetingUri;
    } catch (error) {
      this.logger.error('Failed to create meeting space:', error);
      throw error;
    }
  }
}
