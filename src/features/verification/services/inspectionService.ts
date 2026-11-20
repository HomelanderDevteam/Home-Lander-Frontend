import { apiClient, type ApiClient } from '../../../lib/api/client';
import type { AgentServiceMode, InspectionReportValues } from '../../agents/types/agent';

export interface InspectionSubmissionResult {
  taskId: string;
  taskStatus: string;
  finalVerificationStatus: string;
}

export interface InspectionService {
  readonly mode: AgentServiceMode;
  submit(taskId: string, values: InspectionReportValues): Promise<InspectionSubmissionResult>;
}

export interface InspectionApiContract {
  submit(
    client: ApiClient,
    taskId: string,
    values: InspectionReportValues,
  ): Promise<InspectionSubmissionResult>;
}

export class InspectionApiNotConfiguredError extends Error {
  constructor() {
    super('Inspection reports are not connected to the backend yet.');
    this.name = 'InspectionApiNotConfiguredError';
  }
}

export function createInspectionService(
  client: ApiClient,
  contract?: InspectionApiContract,
): InspectionService {
  if (!contract) {
    return {
      mode: 'api',
      async submit() {
        throw new InspectionApiNotConfiguredError();
      },
    };
  }
  return {
    mode: 'api',
    submit: (taskId, values) => contract.submit(client, taskId, values),
  };
}

export const inspectionApiService = createInspectionService(apiClient);
