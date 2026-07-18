'use client';

import type { MemberResponse, TeamRole } from '@aisoftco/shared';
import { Trash2 } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRemoveMember, useUpdateMemberRole } from '@/hooks/use-teams';
import { useToast } from '@/hooks/use-toast';

const ASSIGNABLE_ROLES: Exclude<TeamRole, 'owner'>[] = ['viewer', 'editor', 'admin'];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

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
  const { toast } = useToast();

  return (
    <div className="divide-y rounded-md border">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between gap-4 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && member.role !== 'owner' ? (
              <Select
                value={member.role}
                onValueChange={(role) => {
                  updateRole.mutate({ memberId: member.id, role: role as Exclude<TeamRole, 'owner'> });
                  toast({ title: 'Role updated', description: `${member.name} is now ${role}.` });
                }}
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      removeMember.mutate(member.id);
                      toast({ title: 'Member removed', description: `${member.name} no longer has access.` });
                    }}
                    disabled={removeMember.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove from team</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
