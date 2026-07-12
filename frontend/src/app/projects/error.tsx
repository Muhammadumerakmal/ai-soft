'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProjectsErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-6 p-8 text-center">
        <h2 className="text-xl font-semibold">Failed to load projects</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </Card>
    </div>
  );
}
