'use client';

import { use } from 'react';

import { AgentOutputViewer } from '@/components/project/agent-output-viewer';
import { AgentTimeline } from '@/components/project/agent-timeline';
import { ApprovalPanel } from '@/components/project/approval-panel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgentStream } from '@/hooks/use-agent-stream';
import { useProject, useWorkflow } from '@/hooks/use-project';

const AGENT_LABEL: Record<string, string> = {
  ceo: 'CEO',
  pm: 'Product Manager',
  architect: 'Architect',
};

const STATUS_VARIANT: Record<string, 'secondary' | 'warning' | 'success' | 'destructive'> = {
  draft: 'secondary',
  running: 'warning',
  completed: 'success',
  failed: 'destructive',
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: workflowData, isLoading: workflowLoading } = useWorkflow(id);
  useAgentStream(id);

  if (projectLoading || workflowLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!project) return null;

  const awaitingStep = workflowData?.steps.find((step) => step.status === 'awaiting_approval');
  const completedOrAwaiting = workflowData?.steps.filter(
    (step) => step.output && (step.status === 'completed' || step.status === 'awaiting_approval')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {workflowData ? (
              <AgentTimeline steps={workflowData.steps} activeStepId={awaitingStep?.id} />
            ) : (
              <p className="text-sm text-muted-foreground">Pipeline hasn&apos;t started yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {awaitingStep && (
            <ApprovalPanel projectId={id} agentLabel={AGENT_LABEL[awaitingStep.agentType] ?? awaitingStep.agentType} />
          )}

          {completedOrAwaiting && completedOrAwaiting.length > 0 ? (
            completedOrAwaiting.map((step) => (
              <Card key={step.id}>
                <CardHeader>
                  <CardTitle className="text-base">{AGENT_LABEL[step.agentType] ?? step.agentType} output</CardTitle>
                </CardHeader>
                <CardContent>
                  {step.output && <AgentOutputViewer agentType={step.agentType} output={step.output} />}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Waiting for the first agent to produce output…
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
