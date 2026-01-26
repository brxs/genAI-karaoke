"use client";

import { AuthProvider } from "@/hooks/useAuth";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
