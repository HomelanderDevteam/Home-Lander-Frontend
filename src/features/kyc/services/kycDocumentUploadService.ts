import { apiClient, type ApiClient } from '../../../lib/api/client';

export interface KycDocumentReference {
  id: string;
}

export interface KycDocumentUploadService {
  readonly isConfigured: boolean;
  upload(file: File): Promise<KycDocumentReference>;
}

/**
 * Define upload fields, transport, and response normalization only after the backend
 * confirms the private document-upload contract.
 */
export interface KycDocumentUploadContract {
  upload(client: ApiClient, file: File): Promise<KycDocumentReference>;
}

export class KycDocumentUploadNotConfiguredError extends Error {
  constructor() {
    super('Secure identity document upload is not configured.');
    this.name = 'KycDocumentUploadNotConfiguredError';
  }
}

export function createKycDocumentUploadService(
  client: ApiClient,
  contract?: KycDocumentUploadContract,
): KycDocumentUploadService {
  if (!contract) {
    return {
      isConfigured: false,
      async upload() {
        throw new KycDocumentUploadNotConfiguredError();
      },
    };
  }

  return {
    isConfigured: true,
    upload: (file) => contract.upload(client, file),
  };
}

export const kycDocumentUploadService = createKycDocumentUploadService(apiClient);
