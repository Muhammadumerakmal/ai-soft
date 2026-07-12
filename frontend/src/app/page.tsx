import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
        <span className="font-semibold">AI Software Company</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Where AI agents collaborate to build software
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Design, build, review, and ship software projects with a team of specialized AI agents.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/register">Get started free</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
