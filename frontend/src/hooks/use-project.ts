'use client';

import type { ProjectResponse, ApproveStepInput, RejectStepInput } from '@aisoftco/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { WorkflowResponse } from '@/types/workflow';

const ACTIVE_STATUSES = new Set(['pending', 'running']);

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => apiClient.get<ProjectResponse>(`/projects/${id}`),
    enabled: Boolean(id),
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['projects', id, 'workflow'],
    queryFn: () => apiClient.get<WorkflowResponse>(`/projects/${id}/workflow`),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.workflow.status;
      return status && ACTIVE_STATUSES.has(status) ? 2500 : false;
    },
  });
}

export function useApproveStep(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ApproveStepInput) => apiClient.post(`/projects/${id}/approve`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

export function useRejectStep(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RejectStepInput) => apiClient.post(`/projects/${id}/reject`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}
