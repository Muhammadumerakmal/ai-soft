'use client';

import type { SubscriptionResponse, CreateCheckoutSessionInput } from '@aisoftco/shared';
import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => apiClient.get<SubscriptionResponse>('/billing/subscription'),
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (input: CreateCheckoutSessionInput) => apiClient.post<{ url: string | null }>('/billing/checkout', input),
  });
}
