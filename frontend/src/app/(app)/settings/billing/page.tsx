'use client';

import { PlanCard } from '@/components/billing/plan-card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscription } from '@/hooks/use-billing';

export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Manage your subscription plan." />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        subscription && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Status:
              <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'}>
                {subscription.status}
              </Badge>
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
