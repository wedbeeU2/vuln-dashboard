import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#64748b",
        panel: "#ffffff",
        line: "#d8dee8",
        brand: "#2563eb",
        good: "#0f9f6e",
        warn: "#b45309",
        bad: "#dc2626"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
