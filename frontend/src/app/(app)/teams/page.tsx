'use client';

import { Users } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { CreateTeamDialog } from '@/components/team/create-team-dialog';
import { TeamCard } from '@/components/team/team-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeams } from '@/hooks/use-teams';

export default function TeamsPage() {
  const { data: teams, isLoading, isError } = useTeams();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Collaborate on projects with role-based access."
        action={<CreateTeamDialog />}
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Failed to load teams.</CardContent>
        </Card>
      )}

      {teams && teams.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No teams yet</p>
              <p className="text-sm text-muted-foreground">Create a team to start collaborating with others.</p>
            </div>
            <CreateTeamDialog />
          </CardContent>
        </Card>
      )}

      {teams && teams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
