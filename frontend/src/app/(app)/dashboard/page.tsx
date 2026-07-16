'use client';

import { FolderKanban } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { CreateProjectDialog } from '@/components/project/create-project-dialog';
import { ProjectCard } from '@/components/project/project-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/use-projects';

export default function DashboardPage() {
  const { data: projects, isLoading, isError } = useProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Describe a project and watch the agent pipeline build it out."
        action={<CreateProjectDialog />}
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Failed to load projects.</CardContent>
        </Card>
      )}

      {projects && projects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No projects yet</p>
              <p className="text-sm text-muted-foreground">Create your first project to kick off the agent pipeline.</p>
            </div>
            <CreateProjectDialog />
          </CardContent>
        </Card>
      )}

      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
