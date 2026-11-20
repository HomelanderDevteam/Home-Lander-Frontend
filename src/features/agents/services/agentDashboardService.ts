import { apiClient, type ApiClient } from '../../../lib/api/client';
import type { AgentDashboardSummary, AgentPropertyTask, AgentServiceMode } from '../types/agent';

export interface AgentDashboardService {
  readonly mode: AgentServiceMode;
  getSummary(): Promise<AgentDashboardSummary>;
  getTask(id: string): Promise<AgentPropertyTask | null>;
  updateTaskStatus(id: string, status: AgentPropertyTask['taskStatus']): Promise<AgentPropertyTask>;
}

export interface AgentDashboardApiContract {
  getSummary(client: ApiClient): Promise<AgentDashboardSummary>;
  getTask(client: ApiClient, id: string): Promise<AgentPropertyTask | null>;
  updateTaskStatus(
    client: ApiClient,
    id: string,
    status: AgentPropertyTask['taskStatus'],
  ): Promise<AgentPropertyTask>;
}

export class AgentDashboardApiNotConfiguredError extends Error {
  constructor() {
    super('Agent dashboard tasks are not connected to the backend yet.');
    this.name = 'AgentDashboardApiNotConfiguredError';
  }
}

export function createAgentDashboardService(
  client: ApiClient,
  contract?: AgentDashboardApiContract,
): AgentDashboardService {
  if (!contract) {
    const unavailable = async (): Promise<never> => {
      throw new AgentDashboardApiNotConfiguredError();
    };
    return {
      mode: 'api',
      getSummary: unavailable,
      getTask: unavailable,
      updateTaskStatus: unavailable,
    };
  }
  return {
    mode: 'api',
    getSummary: () => contract.getSummary(client),
    getTask: (id) => contract.getTask(client, id),
    updateTaskStatus: (id, status) => contract.updateTaskStatus(client, id, status),
  };
}

export const agentDashboardApiService = createAgentDashboardService(apiClient);
