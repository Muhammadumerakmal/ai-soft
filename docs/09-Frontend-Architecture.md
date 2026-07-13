# Frontend Architecture — AI Software Company

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | FE-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Technical Architecture Team |
| **Date** | 2026-07-13 |

---

## 1. Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework with App Router |
| TypeScript | 5.x | Type-safe language |
| Tailwind CSS | Latest (4.x) | Utility-first styling |
| shadcn/ui | Latest | Component library (built on Radix UI) |
| Radix UI | Latest | Accessible headless primitives |
| Socket.IO Client | Latest | Real-time WebSocket communication |
| Zod | Latest | Runtime validation (shared with backend) |
| React Hook Form | Latest | Form management |
| TanStack Query | Latest | Server state management |
| Lucide React | Latest | Icon library |
| Recharts | Latest | Charts and visualisations |
| next-themes | Latest | Dark/light mode |

---

## 2. Directory Structure

```
frontend/
  src/
    app/
      layout.tsx               # Root layout
      page.tsx                 # Landing page
      globals.css              # Tailwind base + theme variables
      (auth)/
        login/page.tsx
        register/page.tsx
        callback/
          [provider]/page.tsx  # OAuth callback
      (dashboard)/
        layout.tsx             # Protected layout (sidebar, header)
        page.tsx               # Dashboard (project list)
        projects/
          [id]/
            page.tsx           # Project detail view
            outputs/
              [outputId]/page.tsx
            settings/
              page.tsx
        teams/
          page.tsx
          [id]/page.tsx
        settings/
          page.tsx
          billing/page.tsx
      api/                      # Next.js API routes (if needed)
    components/
      ui/                       # shadcn/ui generated components
        button.tsx
        card.tsx
        dialog.tsx
        input.tsx
        select.tsx
        toast.tsx
        ...
      layout/
        sidebar.tsx
        header.tsx
        main-content.tsx
      landing/
        hero-section.tsx
        features-section.tsx
        pricing-section.tsx
        cta-section.tsx
      project/
        project-card.tsx
        project-list.tsx
        project-form.tsx          # Create project dialog
        project-status-badge.tsx
        agent-timeline.tsx
        agent-output-viewer.tsx
        approval-panel.tsx
        feedback-form.tsx
        file-browser.tsx
        code-viewer.tsx
        deployment-panel.tsx
        deployment-status.tsx
      agent/
        agent-progress-card.tsx
        agent-streaming-text.tsx
        agent-thinking-bubble.tsx
        tool-use-indicator.tsx
      team/
        team-card.tsx
        member-list.tsx
        invite-form.tsx
      shared/
        theme-toggle.tsx
        user-avatar.tsx
        loading-skeleton.tsx
        empty-state.tsx
        error-boundary.tsx
        pagination.tsx
        search-input.tsx
        confirmation-dialog.tsx
    hooks/
      use-auth.ts
      use-projects.ts
      use-project.ts
      use-agent-stream.ts         # WebSocket hook
      use-approval.ts
      use-teams.ts
      use-deployment.ts
      use-media-query.ts
    lib/
      api-client.ts               # Axios/fetch wrapper
      auth-context.tsx            # Auth context provider
      socket.ts                   # Socket.IO client singleton
      utils.ts                    # Tailwind cn() and utilities
      constants.ts
    providers/
      auth-provider.tsx
      theme-provider.tsx
      query-provider.tsx          # TanStack Query provider
      socket-provider.tsx
    types/
      index.ts                    # Shared types (or from @aisoftco/shared)
    middleware.ts                 # Next.js middleware for auth redirect
  public/
    images/
    favicon.ico
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

---

## 3. Component Architecture

### 3.1 Server vs Client Components

| Component Type | Used For | Rendering |
|---------------|----------|-----------|
| **Server Components** | Landing page, project list (initial data), settings pages, team pages | Rendered on server, streamed to client |
| **Client Components** | Project creation form, agent monitor, approval panel, file browser, real-time updates | Hydrated on client, interactive |

### 3.2 Component Hierarchy

```
App Layout (Server)
├── ThemeProvider (Client)
├── AuthProvider (Client)
├── QueryProvider (Client)
├── SocketProvider (Client)
└── Pages
    ├── LandingPage (Server)
    │   └── HeroSection (Client)
    │   └── FeaturesSection (Server)
    │   └── PricingSection (Server)
    │   └── CTASection (Client)
    ├── LoginPage (Client)
    ├── RegisterPage (Client)
    ├── DashboardLayout (Server)
    │   ├── Sidebar (Client)
    │   ├── Header (Client)
    │   │   ├── SearchInput (Client)
    │   │   ├── ThemeToggle (Client)
    │   │   └── UserAvatar (Client)
    │   └── Pages
    │       ├── DashboardPage (Server)
    │       │   ├── ProjectList (Client)
    │       │   └── ProjectCard (Client)
    │       ├── ProjectDetailPage (Server + Client)
    │       │   ├── ProjectStatusBadge (Client)
    │       │   ├── AgentTimeline (Client)
    │       │   ├── AgentOutputViewer (Client)
    │       │   │   ├── CodeViewer (Client)
    │       │   │   └── FileBrowser (Client)
    │       │   ├── ApprovalPanel (Client)
    │       │   │   └── FeedbackForm (Client)
    │       │   ├── AgentProgressCard (Client)
    │       │   │   ├── AgentStreamingText (Client)
    │       │   │   ├── AgentThinkingBubble (Client)
    │       │   │   └── ToolUseIndicator (Client)
    │       │   └── DeploymentPanel (Client)
    │       └── SettingsPage (Server + Client)
```

---

## 4. State Management Strategy

### 4.1 State Categories
| State Type | Tool | Examples |
|------------|------|----------|
| Server State | TanStack Query | Projects list, project details, teams, files |
| Auth State | React Context | Current user, tokens, login/logout |
| Real-time State | Socket.IO | Agent progress, streaming output |
| Form State | React Hook Form | Project creation, feedback, settings |
| UI State | React useState | Modals, toggles, sidebar state |
| Theme State | next-themes | Dark/light mode |

### 4.2 TanStack Query Configuration
```typescript
// Default stale times
const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s before refetch
      gcTime: 5 * 60_000,       // 5min garbage collection
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
};
```

### 4.3 WebSocket Integration
```typescript
// hooks/use-agent-stream.ts
export function useAgentStream(projectId: string) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    socket.emit('subscribe', { projectId });

    socket.on('agent:output', (data) => {
      queryClient.setQueryData(['project', projectId], (old) => ({
        ...old,
        currentAgentOutput: data
      }));
    });

    socket.on('agent:awaiting_approval', () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    });

    return () => {
      socket.emit('unsubscribe', { projectId });
      socket.off('agent:output');
      socket.off('agent:awaiting_approval');
    };
  }, [projectId, socket, queryClient]);
}
```

---

## 5. Routing Architecture

| Route | Type | Description |
|-------|------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/dashboard` | Protected | Project list |
| `/projects/[id]` | Protected | Project detail |
| `/projects/[id]/outputs/[outputId]` | Protected | Specific agent output |
| `/projects/[id]/settings` | Protected | Project settings |
| `/teams` | Protected | Team list |
| `/teams/[id]` | Protected | Team detail |
| `/settings` | Protected | User settings |
| `/settings/billing` | Protected | Billing management |

### Middleware Protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

---

## 6. Data Fetching Patterns

### 6.1 Server Component Data Fetching
```typescript
// Server component fetching directly from backend
async function DashboardPage() {
  const projects = await fetch(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${cookies().get('accessToken')}` }
  }).then(res => res.json());

  return <ProjectList initialData={projects} />;
}
```

### 6.2 Client Component Data Fetching
```typescript
// Client component using TanStack Query
function ProjectList({ initialData }: { initialData: Project[] }) {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
    initialData
  });

  if (isLoading) return <ProjectListSkeleton />;
  return data.map(project => <ProjectCard key={project.id} project={project} />);
}
```

### 6.3 Mutation Pattern
```typescript
function CreateProjectDialog() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: CreateProjectInput) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema)
  });

  return (
    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))}>
      {/* form fields */}
    </form>
  );
}
```

---

## 7. API Client

```typescript
// lib/api-client.ts
import { createProjectSchema, approveOutputSchema, type CreateProjectInput } from '@aisoftco/shared';

class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL!;
    this.getToken = () => localStorage.getItem('accessToken');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error.code, error.error.message, response.status);
    }

    return response.json();
  }

  async createProject(data: CreateProjectInput) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async approveOutput(projectId: string, comment?: string) {
    return this.request(`/projects/${projectId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  // ... more methods
}

export const apiClient = new ApiClient();
```

---

## 8. Styling Architecture

### 8.1 Theme Configuration
```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(var(--primary-50))',
          // ... generated from shadcn/ui CSS variables
          900: 'hsl(var(--primary-900))'
        },
        // shadcn/ui semantic tokens
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        destructive: 'hsl(var(--destructive))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))'
      }
    }
  }
};
```

### 8.2 CSS Variables (globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode overrides */
  }
}
```

---

## 9. Real-Time Agent Streaming UI

### 9.1 Component Flow
```
AgentStreamingContainer
├── AgentProgressCard (shows current agent, phase, progress bar)
│   ├── AgentStatusBadge (running/awaiting/completed/failed)
│   ├── ProgressIndicator (animated bar or spinner)
│   └── TokenCountDisplay
├── AgentThinkingBubble (animated typing indicator showing current thought)
├── ToolUseIndicator (shows which MCP tools agent is calling)
│   ├── ToolIcon
│   ├── ToolName
│   └── ToolStatus (calling/complete)
├── AgentStreamingText (typewriter-style text display of agent output)
└── AgentOutputViewer (full structured output after completion)
    ├── FilePreview (for generated files)
    ├── DocumentPreview (for markdown docs)
    └── ApprovalPanel (approve/reject with feedback form)
```

---

## 10. Accessibility & Performance

### 10.1 Accessibility Targets
- WCAG 2.1 AA compliance
- Semantic HTML throughout
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in modals and dialogs
- Screen reader-friendly loading states

### 10.2 Performance Targets
| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 1.5s |
| FID (First Input Delay) | < 50ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 2.0s |
| First Load JS Bundle | < 150KB |

### 10.3 Optimizations
- React Server Components for static/non-interactive content
- Dynamic imports for heavy client components (code viewer, charts)
- Image optimisation via Next.js `<Image>` component
- Font optimisation via `next/font`
- Route prefetching for dashboard navigation
- Bundle analysis with `@next/bundle-analyzer`
