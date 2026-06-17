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
        ring: "rgba(37, 99, 235, 0.25)",
        brand: {
          50: "#eff4ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          DEFAULT: "#2563eb"
        },
        good: {
          50: "#ecfbf4",
          100: "#d6f3e6",
          600: "#0f9f6e",
          700: "#0a7d57",
          DEFAULT: "#0f9f6e"
        },
        warn: {
          50: "#fef6e9",
          100: "#fbe7c6",
          600: "#b45309",
          700: "#92400e",
          DEFAULT: "#b45309"
        },
        bad: {
          50: "#fef0f0",
          100: "#fcdcdc",
          600: "#dc2626",
          700: "#b91c1c",
          DEFAULT: "#dc2626"
        },
        slate: {
          50: "#f6f8fb",
          100: "#e8edf4",
          200: "#d8dee8",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          900: "#111827",
          950: "#0b1220"
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(15, 23, 42, 0.08)",
        xs: "0 1px 2px rgba(15, 23, 42, 0.05)"
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px"
      }
    }
  },
  plugins: []
};

export default config;
