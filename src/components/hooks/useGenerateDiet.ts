import { useState } from "react";
import type { CreateGenerationCommand, CreateGenerationResponse } from "../../types";

const useGenerateDiet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const generateDiet = async (data: CreateGenerationCommand): Promise<CreateGenerationResponse | null> => {
    setIsLoading(true);
    setError("");
    setProgress(0);

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

      // Zakładamy, że operacja kończy się natychmiastowo
      setProgress(100);

      const result: CreateGenerationResponse = await response.json();
      return result;
    } catch (err) {
      setError("Błąd sieciowy");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateDiet, isLoading, progress, error };
};

export default useGenerateDiet;
