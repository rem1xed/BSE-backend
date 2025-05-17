import { User } from '../../users/entities/user.entity'; // шлях до твоєї сутності юзера

declare module 'express' {
  export interface Request {
    user?: Partial<User>;
  }
}

