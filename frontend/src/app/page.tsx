import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Software Company
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Multi-agent AI orchestration platform
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="default">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
