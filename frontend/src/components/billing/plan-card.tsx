'use client';

import type { BillingPlan } from '@aisoftco/shared';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateCheckoutSession } from '@/hooks/use-billing';
import { ApiError } from '@/lib/api-client';

const PLAN_DETAILS: Record<BillingPlan, { price: string; features: string[] }> = {
  free: { price: '$0/mo', features: ['1 active project', 'CEO, PM, Architect agents', 'Community support'] },
  pro: { price: '$49/mo', features: ['Unlimited projects', 'Team collaboration', 'Priority support'] },
  enterprise: { price: 'Custom', features: ['SSO & audit logs', 'Dedicated support', 'Custom agent limits'] },
};

export function PlanCard({ plan, currentPlan }: { plan: BillingPlan; currentPlan: BillingPlan }) {
  const [error, setError] = useState<string | null>(null);
  const checkout = useCreateCheckoutSession();
  const details = PLAN_DETAILS[plan];
  const isCurrent = plan === currentPlan;

  const handleUpgrade = async () => {
    setError(null);
    try {
      const result = await checkout.mutateAsync({
        plan,
        successUrl: `${window.location.origin}/settings/billing?checkout=success`,
        cancelUrl: `${window.location.origin}/settings/billing?checkout=cancelled`,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to start checkout.');
    }
  };

  return (
    <Card className={isCurrent ? 'border-primary' : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{plan}</CardTitle>
          {isCurrent && <Badge>Current plan</Badge>}
        </div>
        <CardDescription>{details.price}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {details.features.map((feature) => (
            <li key={feature}>• {feature}</li>
          ))}
        </ul>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
      {plan !== 'free' && (
        <CardFooter>
          <Button className="w-full" onClick={handleUpgrade} disabled={isCurrent || checkout.isPending}>
            {checkout.isPending ? 'Redirecting…' : isCurrent ? 'Current plan' : `Upgrade to ${plan}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
