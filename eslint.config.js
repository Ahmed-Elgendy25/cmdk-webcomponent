import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error", // 🔥 makes prettier errors visible in ESLint
    },
  },
  prettier, // 🔥 disables ESLint rules that conflict with Prettier
];