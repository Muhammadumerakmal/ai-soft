'use client';

import { createProjectSchema, type CreateProjectInput } from '@aisoftco/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/hooks/use-projects';
import { useTeams } from '@/hooks/use-teams';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const createProject = useCreateProject();
  const { toast } = useToast();
  const { data: teams } = useTeams();
  const eligibleTeams = teams?.filter((team) => team.role !== 'viewer') ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { title: '', description: '', techStack: [] },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    setError(null);
    try {
      const project = await createProject.mutateAsync(data);
      reset();
      setOpen(false);
      toast({ title: 'Project created', description: `"${project.title}" is now running through the agent pipeline.` });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create project.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Describe what you want built in plain language. The CEO, PM, and Architect agents will turn it into a
            charter, PRD, and architecture document.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="TaskFlow" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="A task management app where users can create projects, add tasks with due dates, and track progress on a kanban board."
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="techStack">Preferred tech stack</Label>
            <Input
              id="techStack"
              placeholder="next.js, express, postgresql (comma-separated)"
              {...register('techStack', {
                setValueAs: (value: string) =>
                  typeof value === 'string'
                    ? value
                        .split(',')
                        .map((v) => v.trim())
                        .filter(Boolean)
                    : value,
              })}
            />
            {errors.techStack && <p className="text-sm text-destructive">{errors.techStack.message}</p>}
          </div>
          {eligibleTeams.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="teamId">Team (optional)</Label>
              <Controller
                control={control}
                name="teamId"
                render={({ field }) => (
                  <Select value={field.value ?? 'personal'} onValueChange={(v) => field.onChange(v === 'personal' ? undefined : v)}>
                    <SelectTrigger id="teamId">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal (just me)</SelectItem>
                      {eligibleTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating…' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
