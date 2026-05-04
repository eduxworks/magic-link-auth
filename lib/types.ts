export interface User {
  _id?: string;
  email: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface MagicLink {
  _id?: string;
  token: string;
  email: string;
  expiresAt: Date;
  used: boolean;
}

export interface AuthToken {
  userId: string;
  email: string;
  iat: number;
}
