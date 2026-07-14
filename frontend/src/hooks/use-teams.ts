'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  TeamResponse,
  TeamDetailResponse,
  CreateTeamInput,
  InviteMemberInput,
  TeamRole,
} from '@aisoftco/shared';
import { apiClient } from '@/lib/api-client';

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => apiClient.get<TeamResponse[]>('/teams'),
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => apiClient.get<TeamDetailResponse>(`/teams/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeamInput) => apiClient.post<TeamResponse>('/teams', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useInviteMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => apiClient.post(`/teams/${teamId}/members`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
    },
  });
}

export function useUpdateMemberRole(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Exclude<TeamRole, 'owner'> }) =>
      apiClient.patch(`/teams/${teamId}/members/${memberId}`, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
    },
  });
}

export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => apiClient.delete(`/teams/${teamId}/members/${memberId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
    },
  });
}
