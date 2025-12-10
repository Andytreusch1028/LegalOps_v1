import React, { useEffect, useState } from "react";
import "./App.css";

/* ---------------------------------------------------
   Registry Imports (correct paths + correct casing)
--------------------------------------------------- */
import {
  scanFormsFromSnapshot,
  RegisteredForm,
} from "./registry/forms/FormScanner.ts";

import {
  scanValidatorsFromSnapshot,
  RegisteredValidator,
} from "./registry/validators/ValidatorScanner.ts";

import {
  scanWorkflowsFromSnapshot,
  RegisteredWorkflow,
} from "./registry/workflows/WorkflowScanner.ts";

/* ---------------------------------------------------
   Types
--------------------------------------------------- */
type WorkflowItem = {
  id: string;
  label: string;
  filePath: string;
  functions: string[];
};

/* ---------------------------------------------------
   MAIN APP COMPONENT
--------------------------------------------------- */
export default function App() {
  const [manifest, setManifest] = useState<any>(null);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [selected, setSelected] = useState<WorkflowItem | null>(null);

  // registry states
  const [forms, setForms] = useState<RegisteredForm[]>([]);
  const [validators, setValidators] = useState<RegisteredValidator[]>([]);
  const [workflowRegistry, setWorkflowRegistry] = useState<
    RegisteredWorkflow[]
  >([]);

  /* ---------------------------------------------------
     Phase 1 — Load legalops_snapshot.json
  --------------------------------------------------- */
  useEffect(() => {
    fetch("legalops_snapshot.json")
      .then((res) => res.json())
      .then((data) => {
        setManifest(data);

        const items: WorkflowItem[] = data.files
          .filter((f: any) => f.path.includes("/app/"))
          .map((f: any, index: number) => {
            const parts = f.path.split("/");
            const routeHint = parts
              .slice(parts.indexOf("app") + 1)
              .join("/")
              .replace(/(page)\.(tsx|ts|js)$/, "");

            return {
              id: `${index}`,
              label: routeHint || f.path,
              filePath: f.path,
              functions: f.functions || [],
            };
          });

        setWorkflows(items);
        if (items.length > 0) setSelected(items[0]);
      })
      .catch(() => {
        // fallback demo
        setWorkflows([
          {
            id: "0",
            label: "dba-filing",
            filePath: "/src/app/dba-filing/page.tsx",
            functions: ["handleDbaSubmit", "validateDbaForm"],
          },
          {
            id: "1",
            label: "annual-report",
            filePath: "/src/app/annual-report/page.tsx",
            functions: ["handleAnnualSubmit", "validateAnnualForm"],
          },
        ]);
      });
  }, []);

  /* ---------------------------------------------------
     Phase 2 — Load registry (forms, validators, workflows)
  --------------------------------------------------- */
  useEffect(() => {
    const loadedForms = scanFormsFromSnapshot();
    setForms(loadedForms);

    const loadedValidators = scanValidatorsFromSnapshot();
    setValidators(loadedValidators);

    const loadedWorkflows = scanWorkflowsFromSnapshot();
    setWorkflowRegistry(loadedWorkflows);

    console.log("📄 Loaded Forms:", loadedForms);
    console.log("✔ Loaded Validators:", loadedValidators);
    console.log("📌 Workflow Registry:", loadedWorkflows);
  }, []);

  /* ---------------------------------------------------
     When user selects workflow
  --------------------------------------------------- */
  function handleWorkflowSelect(w: WorkflowItem) {
    setSelected(w);

    const relatedForms = forms.filter((f) => f.workflowId === w.label);
    const relatedValidators = validators.filter(
      (v) => v.workflowId === w.label
    );

    console.log("📝 Forms linked:", relatedForms);
    console.log("🔍 Validators linked:", relatedValidators);
  }

  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */
  return (
    <div className="workspace-container">
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <aside className="sidebar">
        <h2>Workflows</h2>
        <p className="sidebar-hint">Click a workflow to inspect it.</p>

        <div className="workflow-list">
          {workflows.map((w) => (
            <div
              key={w.id}
              className={`workflow-item ${
                selected?.id === w.id ? "active" : ""
              }`}
              onClick={() => handleWorkflowSelect(w)}
            >
              {w.label}
            </div>
          ))}
        </div>
      </aside>

      {/* ---------------- MAIN PANEL ---------------- */}
      <main className="main-panel">
        {!selected && <p>Select a workflow from the left.</p>}

        {selected && (
          <>
            <h1>{selected.label}</h1>
            <p className="source-path">Source: {selected.filePath}</p>

            {/* INTENT BOX */}
            <section className="intent-box">
              <h3>Intent / Behavior</h3>
              <textarea placeholder="Describe what this workflow should do..." />
            </section>

            {/* FUNCTION BOX */}
            <section className="function-box">
              <h3>Functions Detected</h3>
              <div className="function-badges">
                {selected.functions.map((fn) => (
                  <span key={fn} className="badge">
                    {fn}
                  </span>
                ))}
              </div>
            </section>

            {/* NEXT STEPS */}
            <section className="upcoming">
              <h3>Next Steps</h3>
              <ul>
                <li>Attach real forms to this workflow</li>
                <li>Add validators (ZIP, email, EIN, county checks)</li>
                <li>Connect Sunbiz, USPS, payments, backend APIs</li>
                <li>AI-assisted tests & code suggestions</li>
                <li>Visual diagram of workflow → forms → API calls</li>
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
