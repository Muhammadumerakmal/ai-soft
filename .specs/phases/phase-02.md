# Phase 2 — SaaS Platform

## Objective
Build the Next.js frontend application with authentication, project dashboard, real-time agent streaming, team management, and Stripe billing integration.

## Scope
The complete customer-facing web application. Connects to the Phase 1 backend. Adds multi-tenant team support and monetisation.

## Phases Included

| Internal Phase | Deliverable |
|----------------|-------------|
| 2.1 Next.js Foundation | App Router, Tailwind, shadcn/ui, providers |
| 2.2 Auth UI | Login/register pages, auth context, API client |
| 2.3 Dashboard | Project list with search/filter, create dialog |
| 2.4 Project View | Detail page, agent timeline, output viewer |
| 2.5 Real-Time Streaming | WebSocket client, live agent progress UI |
| 2.6 Team Management | Team CRUD, memberships, role-based access |
| 2.7 Billing Integration | Stripe checkout, subscription plans, webhooks |

## Key Deliverables
- Next.js 16 application on port 3000 with dashboard layout
- Complete auth flow: register → login → dashboard
- Project creation from natural language via dialog
- Real-time agent progress streaming (typewriter output, tool calls, status)
- Approval panel: approve/reject with feedback textarea
- Team creation, member invitation, role-based project access
- Stripe subscription checkout with free/pro/enterprise tiers

## Files Created
```
frontend/src/app/            (layout, pages, route groups)
frontend/src/components/     (ui/, layout/, project/, agent/, team/)
frontend/src/hooks/          (use-auth, use-projects, use-project, use-agent-stream, use-approval, use-teams, use-billing)
frontend/src/lib/            (api-client, auth-context, socket, utils)
frontend/src/providers/      (auth, theme, query)
frontend/middleware.ts        (route protection)
backend/src/routes/          (team, billing)
backend/src/controllers/     (team, billing)
backend/src/services/         (team, billing)
backend/src/ws/              (Socket.IO server, handlers)
```

## Dependencies
- Phase 1 complete (API, auth, agents)
- Stripe account (test mode)
- Vercel account (optional for preview)

## Acceptance Criteria
- [ ] `npm run dev -w frontend` starts on port 3000
- [ ] Login with valid credentials redirects to dashboard
- [ ] Unauthenticated users redirected to login
- [ ] Dashboard shows project list (or empty state)
- [ ] Create project dialog opens, accepts input, creates project
- [ ] Project detail page shows timeline, outputs, approval panel
- [ ] Real-time agent progress visible during pipeline execution
- [ ] WebSocket reconnects automatically on disconnect
- [ ] Team creation and member invitation works
- [ ] Role-based access restricts project operations
- [ ] Stripe checkout creates subscription
- [ ] Webhook updates subscription status

## Verification
```bash
# Start both servers
cd backend && npm run dev  # :3001
cd frontend && npm run dev  # :3000

# Open browser to http://localhost:3000
# Register → Login → Create project
# Watch agent pipeline execute in real-time
# Approve/reject at each gate
# Create team → invite member → switch accounts → verify access
# Visit /settings/billing → start Stripe checkout
```
