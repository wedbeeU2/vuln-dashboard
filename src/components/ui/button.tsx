import Link from "next/link";
import React from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/ui/styles";

type ButtonVariant = "primary" | "secondary" | "inverse" | "ghost";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border-line bg-white text-ink hover:border-slate-300 hover:bg-slate-50",
  inverse: "border-transparent bg-ink text-white hover:bg-slate-700",
  ghost: "border-transparent bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm"
};

type SharedProps = {
  children: ReactNode;
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  iconLeft,
  iconRight,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: SharedProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={buttonClassName({ className, size, variant })}
      type={type}
      {...props}
    >
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  href,
  iconLeft,
  iconRight,
  size = "md",
  variant = "primary",
  ...props
}: SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link className={buttonClassName({ className, size, variant })} href={href} {...props}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </Link>
  );
}

function buttonClassName({
  className,
  size,
  variant
}: {
  className?: string;
  size: ButtonSize;
  variant: ButtonVariant;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
    sizeClasses[size],
    variantClasses[variant],
    className
  );
}
