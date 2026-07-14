import { CheckCircle2, CircleDashed, Loader2, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { WorkflowStep } from '@/types/workflow';

const AGENT_LABEL: Record<string, string> = {
  ceo: 'CEO',
  pm: 'Product Manager',
  architect: 'Architect',
};

function StepIcon({ status }: { status: WorkflowStep['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-destructive" />;
    case 'running':
      return <Loader2 className="h-5 w-5 animate-spin text-amber-500" />;
    case 'awaiting_approval':
      return <CircleDashed className="h-5 w-5 text-amber-500" />;
    default:
      return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
  }
}

export function AgentTimeline({ steps, activeStepId }: { steps: WorkflowStep[]; activeStepId?: string }) {
  return (
    <ol className="space-y-4">
      {steps.map((step) => (
        <li
          key={step.id}
          className={cn(
            'flex items-start gap-3 rounded-md border p-3 transition-colors',
            step.id === activeStepId && 'border-primary bg-primary/5'
          )}
        >
          <StepIcon status={step.status} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{AGENT_LABEL[step.agentType] ?? step.agentType}</span>
              <span className="text-xs capitalize text-muted-foreground">{step.status.replace('_', ' ')}</span>
            </div>
            {step.errorMessage && <p className="mt-1 text-xs text-destructive">{step.errorMessage}</p>}
            {step.retryCount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">Revised {step.retryCount}x based on feedback</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
