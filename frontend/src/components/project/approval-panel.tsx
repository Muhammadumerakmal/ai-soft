'use client';

import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApproveStep, useRejectStep } from '@/hooks/use-project';
import { ApiError } from '@/lib/api-client';

export function ApprovalPanel({ projectId, agentLabel }: { projectId: string; agentLabel: string }) {
  const [comment, setComment] = useState('');
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const approveStep = useApproveStep(projectId);
  const rejectStep = useRejectStep(projectId);

  const isPending = approveStep.isPending || rejectStep.isPending;

  const handleApprove = async () => {
    setError(null);
    try {
      await approveStep.mutateAsync({ comment: comment || undefined });
      setComment('');
      setMode(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to approve.');
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      setError('Feedback is required to reject and revise.');
      return;
    }
    setError(null);
    try {
      await rejectStep.mutateAsync({ comment });
      setComment('');
      setMode(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reject.');
    }
  };

  return (
    <Card className="border-amber-500/50">
      <CardHeader>
        <CardTitle className="text-base">Review required</CardTitle>
        <CardDescription>
          The {agentLabel} agent is waiting for your approval before the pipeline continues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {mode && (
          <div className="space-y-2">
            <Label htmlFor="feedback">{mode === 'reject' ? 'Feedback (required)' : 'Comment (optional)'}</Label>
            <Textarea
              id="feedback"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                mode === 'reject'
                  ? 'What should change? The agent will revise its output based on this feedback.'
                  : 'Looks good…'
              }
            />
          </div>
        )}
        <div className="flex gap-2">
          {mode !== 'reject' && (
            <Button
              onClick={() => (mode === 'approve' ? handleApprove() : setMode('approve'))}
              disabled={isPending}
            >
              {approveStep.isPending ? 'Approving…' : mode === 'approve' ? 'Confirm approve' : 'Approve'}
            </Button>
          )}
          {mode !== 'approve' && (
            <Button
              variant="destructive"
              onClick={() => (mode === 'reject' ? handleReject() : setMode('reject'))}
              disabled={isPending}
            >
              {rejectStep.isPending ? 'Submitting…' : mode === 'reject' ? 'Confirm reject' : 'Reject'}
            </Button>
          )}
          {mode && (
            <Button
              variant="ghost"
              onClick={() => {
                setMode(null);
                setComment('');
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
