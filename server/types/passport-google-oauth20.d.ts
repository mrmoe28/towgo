declare module 'passport-google-oauth20' {
  import { Strategy as PassportStrategy } from 'passport';
  import express from 'express';

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string | ((req: any) => string);
    scope?: string[];
    proxy?: boolean;
  }

  export interface StrategyProfile {
    id: string;
    displayName: string;
    name: { familyName: string; givenName: string };
    emails?: { value: string; verified?: boolean }[];
    photos?: { value: string }[];
    provider: string;
    _json: any;
  }

  export type VerifyCallback = (
    error: any,
    user?: any,
    info?: any
  ) => void;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: StrategyProfile,
    done: VerifyCallback
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    constructor(verify: VerifyFunction);
    name: string;
    authenticate(req: express.Request, options?: any): void;
  }
}