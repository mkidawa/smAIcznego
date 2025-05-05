import { useState, useRef, useCallback, useEffect } from "react";
import type { CreateGenerationCommand, CreateGenerationResponse, GenerationResponse } from "../../../../types";

const PROGRESS_INTERVAL = 100; // Update progress every 100ms
const MAX_GENERATION_TIME = 120000; // 2 minutes maximum generation time

const useGenerateDiet = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number | null>(null);
  const [generatedDiet, setGeneratedDiet] = useState<GenerationResponse | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const updateUrl = useCallback((id: number | null) => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set("generationId", id.toString());
    } else {
      url.searchParams.delete("generationId");
    }
    window.history.replaceState({}, "", url.toString());
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    startTime.current = null;
  }, []);

  const startProgressTracking = useCallback(() => {
    startTime.current = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsedTime = Date.now() - (startTime.current || Date.now());
      const estimatedProgress = Math.min(99, (elapsedTime / MAX_GENERATION_TIME) * 100);
      setProgress(Math.round(estimatedProgress));
    }, PROGRESS_INTERVAL);
  }, []);

  // Initialize generationId from URL on component mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("generationId");
    if (id) {
      const parsedId = parseInt(id, 10);
      setGenerationId(parsedId);
      // On page refresh with generationId, fetch the generation
      fetch(`/api/generations/${parsedId}`)
        .then((response) => response.json())
        .then((generation: GenerationResponse) => {
          if (generation.status === "completed" && generation.preview) {
            setGeneratedDiet(generation);
            setProgress(100);
            onSuccess();
          }
        })
        .catch((error) => {
          console.error("Error fetching generation:", error);
          setError("Error fetching generation");
        });
    }
  }, [onSuccess]);

  const generateDiet = async (data: CreateGenerationCommand): Promise<CreateGenerationResponse | null> => {
    setIsLoading(true);
    setError("");
    setProgress(0);
    stopProgressTracking();
    startProgressTracking();

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error generating diet");
      }

      const generation: GenerationResponse = await response.json();
      stopProgressTracking();
      setProgress(100);
      setGenerationId(generation.id);
      updateUrl(generation.id);
      setIsLoading(false);
      onSuccess();

      return {
        id: generation.id,
        status: generation.status,
      };
    } catch (error) {
      console.error("Error generating:", error);
      stopProgressTracking();
      setError(error instanceof Error ? error.message : "Network error");
      setIsLoading(false);
      return null;
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => stopProgressTracking();
  }, [stopProgressTracking]);

  return { generateDiet, isLoading, progress, error, generatedDiet, generationId };
};

export default useGenerateDiet;
