"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import axios from "axios";
import type { AnalyzeResult } from "@/lib/analyze/types";
import type { Freelancer } from "@/lib/dataStructuring";

type AnalyzeContextType = {
  result:   AnalyzeResult | null;
  loading:  boolean;
  error:    string | null;
  analyze:  (profile: Freelancer) => Promise<void>;
  reset:    () => void;
};

const AnalyzeContext = createContext<AnalyzeContextType | null>(null);

export function AnalyzeProvider({ children }: { children: ReactNode }) {
  const [result,  setResult]  = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

const analyze = useCallback(async (profile: Freelancer) => {
  setLoading(true);
  setError(null);
  try {
    const res = await axios.post("/api/analyze", { profile });
    if (res.data.success) {
      setResult(res.data.data);
      return res.data.data;
    } else {
      setError(res.data.error);
      return null;
    }
  } catch (err: any) {
    setError(err.message);
    return null;
  } finally {
    setLoading(false);
  }
}, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return (
    <AnalyzeContext.Provider value={{ result, loading, error, analyze, reset }}>
      {children}
    </AnalyzeContext.Provider>
  );
}

export function useAnalyze() {
  const ctx = useContext(AnalyzeContext);
  if (!ctx) throw new Error("useAnalyze must be used inside <AnalyzeProvider>");
  return ctx;
}