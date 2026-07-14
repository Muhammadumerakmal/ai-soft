import type { ProjectResponse } from '@aisoftco/shared';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const STATUS_VARIANT: Record<ProjectResponse['status'], 'secondary' | 'warning' | 'success' | 'destructive'> = {
  draft: 'secondary',
  running: 'warning',
  completed: 'success',
  failed: 'destructive',
};

export function ProjectCard({ project }: { project: ProjectResponse }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
          </div>
          <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
