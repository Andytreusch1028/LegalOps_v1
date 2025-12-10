import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
      "prisma/generated/**",
    ],
  },
  {
    // Disable require() rule for Node.js scripts
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Strict TypeScript and code quality rules
    rules: {
      // Disable unescaped entities rule - overly strict for apostrophes/quotes in JSX
      "react/no-unescaped-entities": "off",
      
      // TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      // Removed type-aware rules that require parserOptions configuration
      // These rules require TypeScript type information which needs additional parser config
      // "@typescript-eslint/prefer-nullish-coalescing": "warn",
      // "@typescript-eslint/prefer-optional-chain": "warn",
      
      // Code quality rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "curly": ["error", "all"],
      "no-throw-literal": "error",
      "prefer-template": "warn",
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "error",
      
      // Import organization (basic rules)
      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
        },
      ],
      
      // React specific
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-no-target-blank": "error",
      "react/jsx-key": "error",
    },
  },
];

export default eslintConfig;
