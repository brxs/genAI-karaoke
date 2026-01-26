"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface PresentationSummary {
  id: string;
  topic: string;
  style: string;
  slideCount: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function usePresentations() {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<PresentationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPresentations = useCallback(async () => {
    if (!user) {
      setPresentations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/presentations");

      if (!response.ok) {
        throw new Error("Failed to fetch presentations");
      }

      const data = await response.json();

      const summaries: PresentationSummary[] = data.map(
        (p: {
          id: string;
          topic: string;
          style: string;
          slideCount: number;
          thumbnailUrl?: string;
          createdAt: string;
          updatedAt: string;
        }) => ({
          id: p.id,
          topic: p.topic,
          style: p.style,
          slideCount: p.slideCount,
          thumbnailUrl: p.thumbnailUrl,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })
      );

      setPresentations(summaries);
    } catch (error) {
      console.error("Error fetching presentations:", error);
      setPresentations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const removeFromList = useCallback((id: string) => {
    setPresentations((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    presentations,
    loading,
    refresh: fetchPresentations,
    removeFromList,
  };
}
