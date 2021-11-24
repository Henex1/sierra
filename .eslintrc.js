module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    "jest/globals": true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "plugin:sierra/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "jest", "sierra"],
  ignorePatterns: ["dist/*"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { ignoreRestSiblings: true, argsIgnorePattern: "^_" },
    ],
    // React is available globally in Next, so we don't need this.
    "react/react-in-jsx-scope": "off",
    // This rule appears to serve no purpose and the docs don't even attempt to
    // explain why it's a good idea.
    "react/no-children-prop": "off",
    // We use typescript, no need to define prop types.
    "react/prop-types": "off",
    // There are many legitimate uses for empty functions and the intent of the
    // code is quite obvious.
    "@typescript-eslint/no-empty-function": "off",
    // Null assertions are easy to spot during code review, and the
    // alternatives are typically very verbose or require refactoring.
    "@typescript-eslint/no-non-null-assertion": "off",
    // Explicit any is easy to spot in code review, and the alternatives can
    // require spending a lot of time to write proper TypeScript types for
    // little gain.
    "@typescript-eslint/no-explicit-any": "off",

    // These are toned down because they occur too often to easily fix in the
    // codebase.
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};
