import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
