import { apiClient, type ApiClient } from '../../../lib/api/client';
import type { KycRecord, KycServiceMode, KycSubmissionInput } from '../types/kyc';

export interface KycService {
  readonly mode: KycServiceMode;
  getCurrent(): Promise<KycRecord>;
  submit(input: KycSubmissionInput): Promise<KycRecord>;
}

/**
 * Implement this contract only after KYC endpoints, response fields, authorization,
 * and the secure document-upload process have been confirmed with the backend.
 */
export interface KycApiContract {
  getCurrent(client: ApiClient): Promise<KycRecord>;
  submit(client: ApiClient, input: KycSubmissionInput): Promise<KycRecord>;
}

export class KycApiNotConfiguredError extends Error {
  constructor() {
    super('KYC verification is not connected to the backend yet.');
    this.name = 'KycApiNotConfiguredError';
  }
}

export function createKycService(client: ApiClient, contract?: KycApiContract): KycService {
  if (!contract) {
    const unavailable = async (): Promise<never> => {
      throw new KycApiNotConfiguredError();
    };
    return { mode: 'api', getCurrent: unavailable, submit: unavailable };
  }

  return {
    mode: 'api',
    getCurrent: () => contract.getCurrent(client),
    submit: (input) => contract.submit(client, input),
  };
}

export const kycApiService = createKycService(apiClient);
