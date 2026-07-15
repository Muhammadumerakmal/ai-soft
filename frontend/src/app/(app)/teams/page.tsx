'use client';

import { CreateTeamDialog } from '@/components/team/create-team-dialog';
import { TeamCard } from '@/components/team/team-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeams } from '@/hooks/use-teams';

export default function TeamsPage() {
  const { data: teams, isLoading, isError } = useTeams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-sm text-muted-foreground">Collaborate on projects with role-based access.</p>
        </div>
        <CreateTeamDialog />
      </div>

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
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <p className="font-medium">No teams yet</p>
            <p className="text-sm text-muted-foreground">Create a team to start collaborating with others.</p>
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
