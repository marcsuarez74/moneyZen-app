// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Critical: No unused vars
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // Warnings for code quality (not errors to avoid breaking existing code)
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Critical accessibility rules - these catch the errors you reported
      "@angular-eslint/template/accessibility-label-has-associated-control": "error",
      "@angular-eslint/template/click-events-have-key-events": "error",
      "@angular-eslint/template/interactive-supports-focus": "error",
      // Warnings for templates (existing code compatibility)
      "@angular-eslint/template/prefer-control-flow": "warn",
      "@angular-eslint/template/prefer-self-closing-tags": "off",
    },
  },
  // Apply prettier last to override other configs
  prettier
);
