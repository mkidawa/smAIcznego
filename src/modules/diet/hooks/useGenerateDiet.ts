import { useState, useRef, useCallback, useEffect } from "react";
import type { CreateGenerationCommand, CreateGenerationResponse, GenerationResponse } from "../../../types";
import type { DietPlanResponse } from "@/types/openRouter";

const POLLING_INTERVAL = 2000; // 2 sekundy między zapytaniami
const MAX_POLLING_TIME = 300000; // 5 minut maksymalnego czasu pollingu

const useGenerateDiet = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number | null>(null);
  const [generatedDiet, setGeneratedDiet] = useState<DietPlanResponse | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    startTime.current = null;
  }, []);

  const checkGenerationStatus = async (generationId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/generations/${generationId}`);
      if (!response.ok) {
        stopPolling();
        setError("Błąd podczas sprawdzania statusu generacji");
        setIsLoading(false);
        return;
      }

      const generation: GenerationResponse = await response.json();

      // Aktualizacja progresu (przykładowa implementacja)
      if (generation.status === "completed" && generation.preview) {
        setProgress(100);
        stopPolling();
        setIsLoading(false);
        setGeneratedDiet(generation.preview);
        onSuccess();
      } else {
        // Sprawdzenie czy nie przekroczyliśmy maksymalnego czasu
        if (startTime.current && Date.now() - startTime.current > MAX_POLLING_TIME) {
          stopPolling();
          setError("Przekroczono maksymalny czas generacji");
          setIsLoading(false);
          return;
        }

        // Przykładowa kalkulacja progresu
        const elapsedTime = Date.now() - (startTime.current || Date.now());
        const estimatedProgress = Math.min(90, (elapsedTime / MAX_POLLING_TIME) * 100);
        setProgress(Math.round(estimatedProgress));
      }
    } catch (err) {
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

      // Rozpoczęcie pollingu
      startTime.current = Date.now();
      pollingInterval.current = setInterval(() => checkGenerationStatus(generation.generation_id), POLLING_INTERVAL);

      return generation;
    } catch (err) {
      setError("Błąd sieciowy");
      return null;
    }
  };

  // Czyszczenie interwału przy odmontowaniu komponentu
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { generateDiet, isLoading, progress, error, generatedDiet };
};

export default useGenerateDiet;
