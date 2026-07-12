import { z } from 'zod';

export const UserStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  priority: z.enum(['high', 'medium', 'low']),
});

export const EpicSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stories: z.array(z.string()),
});

export const RequirementsSchema = z.object({
  projectName: z.string(),
  overview: z.string(),
  userStories: z.array(UserStorySchema),
  epics: z.array(EpicSchema),
  nonFunctionalRequirements: z.array(z.string()),
});

export const ActorSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const UseCaseFlowSchema = z.object({
  name: z.string(),
  steps: z.array(z.string()),
});

export const UseCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  actors: z.array(z.string()),
  preconditions: z.array(z.string()),
  postconditions: z.array(z.string()),
  mainFlow: z.array(z.string()),
  alternativeFlows: z.array(UseCaseFlowSchema),
});

export const DataFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
});

export const DataModelSchema = z.object({
  name: z.string(),
  fields: z.array(DataFieldSchema),
});

export const FunctionalSpecSchema = z.object({
  overview: z.string(),
  actors: z.array(ActorSchema),
  useCases: z.array(UseCaseSchema),
  dataModels: z.array(DataModelSchema),
});

export const ArchitectureDecisionSchema = z.object({
  id: z.string(),
  title: z.string(),
  context: z.string(),
  decision: z.string(),
  alternatives: z.array(z.string()),
  rationale: z.string(),
});

export const ComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  technology: z.string(),
  responsibilities: z.array(z.string()),
  dependencies: z.array(z.string()),
});

export const ApiEndpointSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  path: z.string(),
  description: z.string(),
  requestBody: z.string().optional(),
  response: z.string(),
});

export const ArchitectureSchema = z.object({
  overview: z.string(),
  architectureStyle: z.string(),
  components: z.array(ComponentSchema),
  apiEndpoints: z.array(ApiEndpointSchema),
  decisions: z.array(ArchitectureDecisionSchema),
  dataFlow: z.string(),
});

export const UiComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  props: z.array(z.object({ name: z.string(), type: z.string() })),
  state: z.array(z.object({ name: z.string(), type: z.string() })),
});

export const FrontendPlanSchema = z.object({
  overview: z.string(),
  framework: z.string(),
  pages: z.array(
    z.object({
      name: z.string(),
      route: z.string(),
      description: z.string(),
      components: z.array(z.string()),
    }),
  ),
  components: z.array(UiComponentSchema),
  dataFlow: z.string(),
});

export const BackendPlanSchema = z.object({
  overview: z.string(),
  framework: z.string(),
  modules: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      endpoints: z.array(ApiEndpointSchema),
      models: z.array(z.string()),
    }),
  ),
  middleware: z.array(z.string()),
  auth: z.string(),
});

export const DatabaseSchema = z.object({
  overview: z.string(),
  technology: z.string(),
  tables: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      columns: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          constraints: z.array(z.string()),
        }),
      ),
      relationships: z.array(
        z.object({
          column: z.string(),
          references: z.string(),
          type: z.string(),
        }),
      ),
    }),
  ),
  indexes: z.array(
    z.object({
      name: z.string(),
      columns: z.array(z.string()),
      unique: z.boolean(),
    }),
  ),
});

export const TestCaseSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.enum(['unit', 'integration', 'e2e', 'performance']),
  preconditions: z.array(z.string()),
  steps: z.array(z.string()),
  expectedResult: z.string(),
});

export const QAPlanSchema = z.object({
  overview: z.string(),
  strategy: z.string(),
  testCases: z.array(TestCaseSchema),
  tools: z.array(z.string()),
  coverage: z.string(),
});

export const SecurityFindingSchema = z.object({
  id: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string(),
  affectedComponent: z.string(),
  remediation: z.string(),
});

export const SecurityReviewSchema = z.object({
  overview: z.string(),
  methodology: z.string(),
  findings: z.array(SecurityFindingSchema),
  recommendations: z.array(z.string()),
  summary: z.string(),
});

export const DocumentationSchema = z.object({
  overview: z.string(),
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      subsections: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        }),
      ),
    }),
  ),
  apiDocs: z.array(
    z.object({
      endpoint: z.string(),
      method: z.string(),
      description: z.string(),
      parameters: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          description: z.string(),
        }),
      ),
      response: z.string(),
    }),
  ),
  setupGuide: z.string(),
});

export type Requirements = z.infer<typeof RequirementsSchema>;
export type FunctionalSpec = z.infer<typeof FunctionalSpecSchema>;
export type Architecture = z.infer<typeof ArchitectureSchema>;
export type FrontendPlan = z.infer<typeof FrontendPlanSchema>;
export type BackendPlan = z.infer<typeof BackendPlanSchema>;
export type Database = z.infer<typeof DatabaseSchema>;
export type QAPlan = z.infer<typeof QAPlanSchema>;
export type SecurityReview = z.infer<typeof SecurityReviewSchema>;
export type Documentation = z.infer<typeof DocumentationSchema>;
