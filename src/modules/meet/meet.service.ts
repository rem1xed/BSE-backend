import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticate } from '@google-cloud/local-auth';
import { SpacesServiceClient } from '@google-apps/meet';
import { OAuth2Client, UserRefreshClient, GoogleAuth } from 'google-auth-library';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IMeetingResponse } from './meet.interface';

@Injectable()
export class MeetService {
  private readonly logger = new Logger(MeetService.name);
  private readonly SCOPES = ['https://www.googleapis.com/auth/meetings.space.created'];
  private readonly TOKEN_PATH: string;
  private readonly CREDENTIALS_PATH: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.TOKEN_PATH = path.join(process.cwd(), 'token.json');
    this.CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
  }

  async createMeetingForUsers(user1Id: number, user2Id: number): Promise<IMeetingResponse> {
    try {
      const authClient = await this.authorize();
      if (!authClient) {
        throw new Error('Failed to authorize with Google');
      }
      const meetUrl = await this.createSpace(authClient);
      return {
        meetingUri: meetUrl,
        status: 'created'
      };
    } catch (error) {
      this.logger.error('Failed to create meeting:', error);
      return {
        meetingUri: '',
        status: 'failed',
        error: error.message
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
        credentials.redirect_uris ? credentials.redirect_uris[0] : undefined
      );
      client.setCredentials({ refresh_token: credentials.refresh_token });
      return client;
    } catch (err) {
      this.logger.debug('No saved credentials found');
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
        return client;
      }

      // Authenticate and get OAuth2Client
      const auth = await authenticate({
        scopes: this.SCOPES,
        keyfilePath: this.CREDENTIALS_PATH,
      });

      // Save refresh token
      if (auth?.credentials?.refresh_token) {
        // Create a new OAuth2Client instance with credentials from auth
        const content = await fs.readFile(this.CREDENTIALS_PATH, 'utf-8');
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const tempClient = new OAuth2Client(
          key.client_id,
          key.client_secret,
          key.redirect_uris ? key.redirect_uris[0] : undefined
        );
        tempClient.setCredentials(auth.credentials);
        await this.saveCredentials(tempClient);
      }

      // Read client_id and client_secret from credentials.json
      const content = await fs.readFile(this.CREDENTIALS_PATH, 'utf-8');
      const keys = JSON.parse(content);
      const key = keys.installed || keys.web;

      // Use refresh_token from auth.credentials
      const refreshToken = auth.credentials.refresh_token || '';

      client = new OAuth2Client(
        key.client_id,
        key.client_secret,
        key.redirect_uris ? key.redirect_uris[0] : undefined
      );
      client.setCredentials({ refresh_token: refreshToken });

      return client;
    } catch (error) {
      this.logger.error('Authorization failed:', error);
      return null;
    }
  }

  private async createSpace(authClient: OAuth2Client): Promise<string> {
    try {
      // Create a GoogleAuth instance using the OAuth2Client
      const googleAuth = new GoogleAuth({
        scopes: this.SCOPES
      });
      
      // Set the client to use
      googleAuth.cachedCredential = authClient;
      
      const meetClient = new SpacesServiceClient({
        _authClient: googleAuth,
        get authClient() {
          return this._authClient;
        },
        set authClient(value) {
          this._authClient = value;
        },
      });

      const request = {};
      const response = await meetClient.createSpace(request);
      const meetingUri = response[0]?.meetingUri;

      if (!meetingUri) {
        throw new Error('Failed to create meeting space');
      }

      return meetingUri;
    } catch (error) {
      this.logger.error('Failed to create meeting space:', error);
      throw error;
    }
  }
}