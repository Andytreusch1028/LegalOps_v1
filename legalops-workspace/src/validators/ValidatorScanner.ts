// src/registry/validators/ValidatorScanner.ts

export type RegisteredValidator = {
  id: string;
  workflowId: string;
  name: string;
};

export function scanValidatorsFromSnapshot(): RegisteredValidator[] {
  // Placeholder for now
  return [
    {
      id: "zip-validator",
      workflowId: "dba-filing",
      name: "validateZipCode",
    }
  ];
}
