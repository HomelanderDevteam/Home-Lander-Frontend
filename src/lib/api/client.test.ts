import { describe, expect, it, vi } from 'vitest';
import { ApiConfigurationError, createApiClient } from './client';

interface TestPaths {
  '/health': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': { status: string };
          };
        };
      };
    };
  };
}

describe('OpenAPI client', () => {
  it('uses the configured base URL and injected authentication headers', async () => {
    const fetch = vi.fn(async (request: Request) => {
      expect(request.url).toBe('https://api.example.test/health');
      expect(request.headers.get('Authorization')).toBe('Bearer test-token');
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const client = createApiClient<TestPaths>({
      baseUrl: 'https://api.example.test',
      getAuthHeaders: () => ({ Authorization: 'Bearer test-token' }),
      fetch,
    });

    await expect(client.GET('/health')).resolves.toMatchObject({
      data: { status: 'ok' },
    });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('surfaces HTTP failures as ApiHttpError', async () => {
    const client = createApiClient<TestPaths>({
      baseUrl: 'https://api.example.test',
      fetch: async () => new Response(null, { status: 503, statusText: 'Unavailable' }),
    });

    await expect(client.GET('/health')).rejects.toMatchObject({
      name: 'ApiHttpError',
      status: 503,
      statusText: 'Unavailable',
    });
  });

  it('rejects requests when the API base URL is missing', async () => {
    const client = createApiClient<TestPaths>({
      baseUrl: '',
      fetch: vi.fn(),
    });

    await expect(client.GET('/health')).rejects.toBeInstanceOf(ApiConfigurationError);
  });
});
