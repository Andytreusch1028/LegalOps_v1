// src/registry/forms/formScanner.ts

/**
 * Form Scanner for the LegalOps Workspace
 * ---------------------------------------
 * This module reads the LegalOps snapshot (legalops_snapshot.json),
 * finds all the form-related files, extracts field metadata and validator hints,
 * and returns structured form objects that the workspace UI can use.
 */

export type FormField = {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validators?: string[];
};

export type RegisteredForm = {
  id: string;
  name: string;
  sourcePath: string;
  fields: FormField[];
  workflow?: string;
};

export async function scanFormsFromSnapshot(): Promise<RegisteredForm[]> {
  // Load the snapshot file that the user placed in /public
  const res = await fetch("legalops_snapshot.json");
  const snapshot = await res.json();

  const formFiles = snapshot.files.filter((file: any) =>
    file.path.includes("/components/") ||
    file.path.includes("/forms/") ||
    file.path.includes("form") ||
    file.path.includes("Form")
  );

  const detectedForms: RegisteredForm[] = [];

  formFiles.forEach((file: any, index: number) => {
    // Attempt to infer a form name from the file path
    const pathParts = file.path.split("/");
    const fileName = pathParts[pathParts.length - 1]
      .replace(/\.(tsx|ts|js|jsx)$/, "")
      .replace(/[-_]/g, " ");

    // Placeholder: later phases will open and parse the actual file
    const fields: FormField[] = [];

    detectedForms.push({
      id: `form-${index}`,
      name: fileName,
      sourcePath: file.path,
      fields,
    });
  });

  return detectedForms;
}
