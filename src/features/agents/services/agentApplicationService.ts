import { apiClient, type ApiClient } from '../../../lib/api/client';
import type {
  AgentApplicationRecord,
  AgentApplicationValues,
  AgentServiceMode,
} from '../types/agent';

export interface AgentApplicationService {
  readonly mode: AgentServiceMode;
  getCurrent(): Promise<AgentApplicationRecord>;
  submit(values: AgentApplicationValues): Promise<AgentApplicationRecord>;
}

export interface AgentApplicationApiContract {
  getCurrent(client: ApiClient): Promise<AgentApplicationRecord>;
  submit(client: ApiClient, values: AgentApplicationValues): Promise<AgentApplicationRecord>;
}

export class AgentApplicationApiNotConfiguredError extends Error {
  constructor() {
    super('Agent applications are not connected to the backend yet.');
    this.name = 'AgentApplicationApiNotConfiguredError';
  }
}

export function createAgentApplicationService(
  client: ApiClient,
  contract?: AgentApplicationApiContract,
): AgentApplicationService {
  if (!contract) {
    const unavailable = async (): Promise<never> => {
      throw new AgentApplicationApiNotConfiguredError();
    };
    return { mode: 'api', getCurrent: unavailable, submit: unavailable };
  }
  return {
    mode: 'api',
    getCurrent: () => contract.getCurrent(client),
    submit: (values) => contract.submit(client, values),
  };
}

export const agentApplicationApiService = createAgentApplicationService(apiClient);
