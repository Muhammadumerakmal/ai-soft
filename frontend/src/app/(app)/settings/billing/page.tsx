'use client';

import { PlanCard } from '@/components/billing/plan-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscription } from '@/hooks/use-billing';

export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription plan.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : (
        subscription && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Status: <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'}>{subscription.status}</Badge>
              {subscription.cancelAtPeriodEnd && <Badge variant="warning">Cancels at period end</Badge>}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <PlanCard plan="free" currentPlan={subscription.plan} />
              <PlanCard plan="pro" currentPlan={subscription.plan} />
              <PlanCard plan="enterprise" currentPlan={subscription.plan} />
            </div>
          </>
        )
      )}
    </div>
  );
}
