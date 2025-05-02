import { useState, useRef, useCallback, useEffect } from "react";
import type { CreateGenerationCommand, CreateGenerationResponse, GenerationResponse } from "../../../../types";

const POLLING_INTERVAL = 2000; // 2 sekundy między zapytaniami
const MAX_POLLING_TIME = 300000; // 5 minut maksymalnego czasu pollingu

const useGenerateDiet = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
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

  // Inicjalizacja generationId z URL po zamontowaniu komponentu
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("generationId");
    if (id) {
      const parsedId = parseInt(id, 10);
      setGenerationId(parsedId);
      setIsLoading(true);
      startTime.current = Date.now();
      checkGenerationStatus(parsedId);
      pollingInterval.current = setInterval(() => checkGenerationStatus(parsedId), POLLING_INTERVAL);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    startTime.current = null;
  }, []);

  const checkGenerationStatus = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/generations/${id}`);
      if (!response.ok) {
        stopPolling();
        setError("Błąd podczas sprawdzania statusu generacji");
        setIsLoading(false);
        return;
      }

      const generation: GenerationResponse = await response.json();

      if (generation.status === "completed" && generation.preview) {
        setProgress(100);
        stopPolling();
        setIsLoading(false);
        setGeneratedDiet(generation);
        onSuccess();
      } else {
        if (startTime.current && Date.now() - startTime.current > MAX_POLLING_TIME) {
          stopPolling();
          setError("Przekroczono maksymalny czas generacji");
          setIsLoading(false);
          return;
        }

        const elapsedTime = Date.now() - (startTime.current || Date.now());
        const estimatedProgress = Math.min(90, (elapsedTime / MAX_POLLING_TIME) * 100);
        setProgress(Math.round(estimatedProgress));
      }
    } catch (error) {
      console.error("Błąd podczas sprawdzania statusu:", error);
      stopPolling();
      setError("Błąd podczas sprawdzania statusu generacji");
      setIsLoading(false);
    }
  };

  const generateDiet = async (data: CreateGenerationCommand): Promise<CreateGenerationResponse | null> => {
    setIsLoading(true);
    setError("");
    setProgress(0);
    stopPolling();

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Wystąpił błąd podczas generowania diety");
        return null;
      }

      const generation: CreateGenerationResponse = await response.json();
      setGenerationId(generation.generation_id);
      updateUrl(generation.generation_id);

      startTime.current = Date.now();
      pollingInterval.current = setInterval(() => checkGenerationStatus(generation.generation_id), POLLING_INTERVAL);

      return generation;
    } catch (error) {
      console.error("Błąd podczas generowania:", error);
      setError("Błąd sieciowy");
      return null;
    }
  };

  // Czyszczenie interwału przy odmontowaniu komponentu
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { generateDiet, isLoading, progress, error, generatedDiet, generationId };
};

export default useGenerateDiet;
