export interface IMeetingResponse {
  meetingUri: string;
  status: 'created' | 'failed';
  error?: string;
}