import js from "@eslint/js";
import globals from "globals";
import securityPlugin from "eslint-plugin-security";

export default [
  {
    ignores: ["node_modules/**", "uploads/**", "backend.log"],
  },
  {
    files: ["**/*.js"],
    plugins: {
      security: securityPlugin,
    },
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "security/detect-object-injection": "off",
    },
  },
];
