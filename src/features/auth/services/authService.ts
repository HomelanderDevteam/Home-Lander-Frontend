import type { ApiClient } from '../../../lib/api/client';
import type {
  AuthUser,
  EmailVerificationInput,
  LoginInput,
  PasswordResetInput,
  PasswordResetRequestInput,
  RegistrationInput,
} from '../types/auth';

export interface AuthService {
  readonly isConfigured: boolean;
  getSession(): Promise<AuthUser | null>;
  login(input: LoginInput): Promise<AuthUser>;
  register(input: RegistrationInput): Promise<void>;
  requestPasswordReset(input: PasswordResetRequestInput): Promise<void>;
  resetPassword(input: PasswordResetInput): Promise<void>;
  verifyEmail(input: EmailVerificationInput): Promise<void>;
  logout(): Promise<void>;
}

/**
 * TODO(auth API): implement this adapter after endpoint, payload, response, and session contracts
 * are agreed. Keep credential/session handling inside the backend-specific adapter.
 */
export interface AuthApiContract {
  getSession(client: ApiClient): Promise<AuthUser | null>;
  login(client: ApiClient, input: LoginInput): Promise<AuthUser>;
  register(client: ApiClient, input: RegistrationInput): Promise<void>;
  requestPasswordReset(client: ApiClient, input: PasswordResetRequestInput): Promise<void>;
  resetPassword(client: ApiClient, input: PasswordResetInput): Promise<void>;
  verifyEmail(client: ApiClient, input: EmailVerificationInput): Promise<void>;
  logout(client: ApiClient): Promise<void>;
}

export class AuthNotConfiguredError extends Error {
  constructor() {
    super('Authentication is not connected yet. Please try again after setup is complete.');
    this.name = 'AuthNotConfiguredError';
  }
}

export function createAuthService(client: ApiClient, contract?: AuthApiContract): AuthService {
  if (!contract) {
    const unavailable = async (): Promise<never> => {
      throw new AuthNotConfiguredError();
    };

    return {
      isConfigured: false,
      getSession: unavailable,
      login: unavailable,
      register: unavailable,
      requestPasswordReset: unavailable,
      resetPassword: unavailable,
      verifyEmail: unavailable,
      logout: unavailable,
    };
  }

  return {
    isConfigured: true,
    getSession: () => contract.getSession(client),
    login: (input) => contract.login(client, input),
    register: (input) => contract.register(client, input),
    requestPasswordReset: (input) => contract.requestPasswordReset(client, input),
    resetPassword: (input) => contract.resetPassword(client, input),
    verifyEmail: (input) => contract.verifyEmail(client, input),
    logout: () => contract.logout(client),
  };
}
