// src/registry/workflows/WorkflowScanner.ts

export type RegisteredWorkflow = {
  id: string;
  name: string;
  path: string;
};

export function scanWorkflowsFromSnapshot(): RegisteredWorkflow[] {
  return [
    {
      id: "w1",
      name: "dba-filing",
      path: "/src/app/dba-filing/page.tsx"
    }
  ];
}
