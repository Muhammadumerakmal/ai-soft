import Link from 'next/link';
import type { TeamResponse } from '@aisoftco/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TeamCard({ team }: { team: TeamResponse }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <Badge variant="outline">{team.role}</Badge>
          </div>
          {team.description && <CardDescription className="line-clamp-2">{team.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {team.memberCount} member{team.memberCount === 1 ? '' : 's'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
