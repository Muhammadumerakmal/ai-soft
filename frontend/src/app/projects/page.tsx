'use client';

import { useAuth } from '@/features/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FolderKanban } from 'lucide-react';

export default function ProjectsPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your software projects</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No projects yet</CardTitle>
          <CardDescription>
            Create your first project to get started with AI-powered software development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <FolderKanban className="h-12 w-12 text-muted-foreground" />
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create your first project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
