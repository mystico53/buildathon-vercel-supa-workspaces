import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable TypeScript-specific rules for faster development
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      
      // Relax React rules for rapid prototyping
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",
      
      // Disable strict checking for hackathon speed
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      
      // Allow flexibility for hackathon development
      "prefer-const": "off",
      "no-var": "off"
    }
  }
];

export default eslintConfig;
