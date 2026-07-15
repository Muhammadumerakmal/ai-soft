'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getSocket } from '@/lib/socket';
import type { WorkflowResponse } from '@/types/workflow';

export function useAgentStream(projectId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    socket.connect();

    const joinRoom = () => socket.emit('project:join', projectId);
    const handleUpdate = (data: WorkflowResponse) => {
      queryClient.setQueryData(['projects', projectId, 'workflow'], data);
    };

    socket.on('connect', joinRoom);
    socket.on('workflow:update', handleUpdate);
    if (socket.connected) joinRoom();

    return () => {
      socket.emit('project:leave', projectId);
      socket.off('connect', joinRoom);
      socket.off('workflow:update', handleUpdate);
    };
  }, [projectId, queryClient]);
}
