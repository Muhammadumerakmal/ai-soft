'use client';

import { use } from 'react';
import { useTeam } from '@/hooks/use-teams';
import { InviteMemberDialog } from '@/components/team/invite-member-dialog';
import { MemberList } from '@/components/team/member-list';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: team, isLoading } = useTeam(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!team) return null;

  const canManage = team.role === 'owner' || team.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <Badge variant="outline">{team.role}</Badge>
      </div>
      {team.description && <p className="max-w-2xl text-sm text-muted-foreground">{team.description}</p>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Members ({team.members.length})</CardTitle>
          {canManage && <InviteMemberDialog teamId={id} />}
        </CardHeader>
        <CardContent>
          <MemberList teamId={id} members={team.members} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
