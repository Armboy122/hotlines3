import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "**/.next/**",
    ".next-broken*/**",
    "**/.next-broken*/**",
    ".next-stale*/**",
    "**/.next-stale*/**",
    ".next-*/**",
    "**/.next-*/**",
    "out/**",
    "node_modules/**",
  ]),
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
]);
