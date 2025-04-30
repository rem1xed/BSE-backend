import { ResetToken } from './models/reset-token.model';

export const authProviders = [
  {
    provide: 'RESET_TOKEN_REPOSITORY',
    useValue: ResetToken,
  },
];