import type { AgentType, CEOOutput, PMOutput, ArchitectOutput } from '@aisoftco/shared';

import { Badge } from '@/components/ui/badge';

function List({ items }: { items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function CeoView({ output }: { output: CEOOutput }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold">Vision</h4>
        <p className="text-sm text-muted-foreground">{output.vision}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold">Scope</h4>
        <p className="text-sm text-muted-foreground">{output.scope}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold">Target Audience</h4>
        <List items={output.targetAudience} />
      </div>
      <div>
        <h4 className="text-sm font-semibold">Success Criteria</h4>
        <List items={output.successCriteria} />
      </div>
      <div>
        <h4 className="text-sm font-semibold">Tech Stack</h4>
        <div className="flex flex-wrap gap-1 pt-1">
          {output.techStack.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
      {output.constraints && output.constraints.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold">Constraints</h4>
          <List items={output.constraints} />
        </div>
      )}
    </div>
  );
}

function PmView({ output }: { output: PMOutput }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold">Product Overview</h4>
        <p className="text-sm text-muted-foreground">{output.productOverview}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold">Target Personas</h4>
        <List items={output.targetPersonas} />
      </div>
      <div>
        <h4 className="text-sm font-semibold">User Stories</h4>
        <div className="space-y-3 pt-1">
          {output.userStories.map((story, i) => (
            <div key={i} className="rounded-md border p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{story.title}</span>
                <Badge variant="outline">{story.priority}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                As a {story.asA}, I want {story.iWant}, so that {story.soThat}.
              </p>
              <List items={story.acceptanceCriteria} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold">Feature List</h4>
        <List items={output.featureList} />
      </div>
    </div>
  );
}

function ArchitectView({ output }: { output: ArchitectOutput }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold">System Overview</h4>
        <p className="text-sm text-muted-foreground">{output.systemOverview}</p>
        <Badge variant="outline" className="mt-2">
          {output.architectureStyle}
        </Badge>
      </div>
      <div>
        <h4 className="text-sm font-semibold">Components</h4>
        <div className="space-y-2 pt-1">
          {output.components.map((c, i) => (
            <div key={i} className="rounded-md border p-3 text-sm">
              <span className="font-medium">{c.name}</span> — {c.responsibility}{' '}
              <span className="text-muted-foreground">({c.technology})</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold">API Endpoints</h4>
        <div className="space-y-1 pt-1 font-mono text-xs">
          {output.apiEndpoints.map((ep, i) => (
            <div key={i}>
              <Badge variant="secondary" className="mr-2 font-mono">
                {ep.method}
              </Badge>
              {ep.path} — <span className="text-muted-foreground">{ep.description}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold">Tech Stack</h4>
        <div className="flex flex-wrap gap-1 pt-1">
          {output.techStack.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AgentOutputViewer({ agentType, output }: { agentType: AgentType; output: Record<string, unknown> }) {
  switch (agentType) {
    case 'ceo':
      return <CeoView output={output as unknown as CEOOutput} />;
    case 'pm':
      return <PmView output={output as unknown as PMOutput} />;
    case 'architect':
      return <ArchitectView output={output as unknown as ArchitectOutput} />;
    default:
      return <pre className="overflow-auto text-xs">{JSON.stringify(output, null, 2)}</pre>;
  }
}
