import createClient, { type Client, type ClientOptions, type Middleware } from 'openapi-fetch';
import type { paths } from './generated/schema';
import { apiConfig } from '../../config/api';

export type ApiClient = Client<paths>;

export interface ApiClientOptions {
  baseUrl?: string;
  getAuthHeaders?: () => HeadersInit | Promise<HeadersInit>;
  fetch?: ClientOptions['fetch'];
}

export class ApiConfigurationError extends Error {
  constructor() {
    super('Set VITE_API_BASE_URL before making API requests.');
    this.name = 'ApiConfigurationError';
  }
}

export class ApiHttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;

  constructor(status: number, statusText: string, url: string) {
    super(`API request failed with HTTP ${status}${statusText ? ` ${statusText}` : ''}.`);
    this.name = 'ApiHttpError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
  }
}

export function createApiClient<Paths extends object = paths>(
  options: ApiClientOptions = {},
): Client<Paths> {
  const baseUrl = options.baseUrl ?? apiConfig.baseUrl;
  const requestBaseUrl = baseUrl || (typeof window === 'undefined' ? '' : window.location.origin);
  const client = createClient<Paths>({
    baseUrl: requestBaseUrl,
    fetch: options.fetch,
    headers: { Accept: 'application/json' },
  });

  const middleware: Middleware = {
    async onRequest({ request }) {
      if (!baseUrl) {
        throw new ApiConfigurationError();
      }

      if (!options.getAuthHeaders) {
        return request;
      }

      const headers = new Headers(request.headers);
      new Headers(await options.getAuthHeaders()).forEach((value, key) => {
        headers.set(key, value);
      });

      return new Request(request, { headers });
    },
    onResponse({ request, response }) {
      if (!response.ok) {
        throw new ApiHttpError(response.status, response.statusText, request.url);
      }
    },
  };
  client.use(middleware);

  return client;
}

export const apiClient = createApiClient();
