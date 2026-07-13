# Frontend Development Rules

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (utility-first)
- **Components:** shadcn/ui (based on Radix UI primitives)
- **State Management:** TanStack Query (server), React Context (auth), React Hook Form (forms)
- **Real-Time:** Socket.IO Client
- **Icons:** Lucide React

## Component Architecture

### Server vs Client Components

| Use Server Components For | Use Client Components For |
|--------------------------|--------------------------|
| Initial data fetching | Mutations and real-time updates |
| SEO content | Interactive UI |
| Static pages | Forms and inputs |
| Layout shell | Event handlers |
| Metadata | Browser-only APIs |

**Rule:** Default to Server Components. Add `'use client'` only when interactivity is required.

### Component Patterns

```typescript
// Server Component (no 'use client' directive)
async function ProjectList() {
  const projects = await getProjects();
  return <div>{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}

// Client Component (explicit 'use client')
'use client';
function ApprovalPanel({ outputId, onApproved }: Props) {
  const [comment, setComment] = useState('');
  // ...
}
```

### Component Props

```typescript
// Always define a Props type/interface
type ProjectCardProps = {
  project: Project;
  onSelect?: (id: string) => void;
  className?: string;
};

function ProjectCard({ project, onSelect, className }: ProjectCardProps) {
  // ...
}
```

## State Management Rules

| State Type | Tool | Persistence |
|------------|------|-------------|
| Server data | TanStack Query | Cache (configurable stale time) |
| Auth state | React Context + localStorage | JWT tokens |
| Real-time events | Socket.IO | In-memory only |
| Form state | React Hook Form | Local component |
| UI state | useState / useReducer | Component scope |
| Theme | next-themes | localStorage |
| URL state | useParams / useSearchParams | URL bar |

## Data Fetching Patterns

```typescript
// TanStack Query hooks
function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.getProject(id),
    staleTime: 30_000,  // 30s before refetch
  });
}

// Mutations with cache invalidation
function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created!');
    },
  });
}
```

## API Client Pattern

```typescript
// lib/api-client.ts — single fetch wrapper
class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL!;
  private getToken = () => localStorage.getItem('accessToken');

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`,
        ...options.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error.code, error.error.message);
    }
    return response.json();
  }

  getProjects = () => this.request<Project[]>('/projects');
  createProject = (data: CreateProjectInput) =>
    this.request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) });
}

export const apiClient = new ApiClient();
```

## Routing Conventions

- **Route groups** for auth vs protected: `(auth)/`, `(dashboard)/`
- **Dynamic routes** with `[param]` naming
- **Loading states** via `loading.tsx` per route segment
- **Error boundaries** via `error.tsx` per route segment
- **Middleware** for route protection at `src/middleware.ts`

## Styling Rules

- Use Tailwind utility classes exclusively
- No custom CSS files (except `globals.css` for CSS variables)
- shadcn/ui CSS variables for theme consistency
- Responsive design using Tailwind breakpoints (sm, md, lg, xl)
- Dark mode via `class` strategy with `next-themes`

## Accessibility

- WCAG 2.1 AA compliance required
- Semantic HTML throughout
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in modals and dialogs
- Screen reader-friendly loading states

## Bundle Size Rules

- Dynamic imports for heavy components (code viewer, charts)
- Image optimisation via `<Image>` component
- Font optimisation via `next/font`
- No large libraries in client components
- Monitor bundle with `@next/bundle-analyzer`

## File Naming

| File Type | Convention | Example |
|-----------|------------|---------|
| Page | `page.tsx` | `projects/[id]/page.tsx` |
| Layout | `layout.tsx` | `(dashboard)/layout.tsx` |
| Component | PascalCase | `ProjectCard.tsx` |
| Hook | camelCase + `use-` | `use-project.ts` |
| Utility | kebab-case | `api-client.ts` |
| Provider | kebab-case | `auth-provider.tsx` |
