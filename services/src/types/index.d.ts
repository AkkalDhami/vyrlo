import { Request } from 'express';

export type CachedKeyType = {
  userId: string;
  apiKeyDigest: string;
  expiresAt: number;
};

export interface RequestType extends Request {
  user: {
    id: string;
    keyId: string;
  };
}
