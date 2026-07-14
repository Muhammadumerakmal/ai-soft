'use client';

import type { MemberResponse, TeamRole } from '@aisoftco/shared';
import { useRemoveMember, useUpdateMemberRole } from '@/hooks/use-teams';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ASSIGNABLE_ROLES: Exclude<TeamRole, 'owner'>[] = ['viewer', 'editor', 'admin'];

export function MemberList({
  teamId,
  members,
  canManage,
}: {
  teamId: string;
  members: MemberResponse[];
  canManage: boolean;
}) {
  const updateRole = useUpdateMemberRole(teamId);
  const removeMember = useRemoveMember(teamId);

  return (
    <div className="divide-y rounded-md border">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between gap-4 p-3">
          <div>
            <p className="text-sm font-medium">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {canManage && member.role !== 'owner' ? (
              <Select
                value={member.role}
                onValueChange={(role) =>
                  updateRole.mutate({ memberId: member.id, role: role as Exclude<TeamRole, 'owner'> })
                }
              >
                <SelectTrigger className="h-8 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline">{member.role}</Badge>
            )}
            {canManage && member.role !== 'owner' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMember.mutate(member.id)}
                disabled={removeMember.isPending}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
