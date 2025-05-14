import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "astro:transitions/client";

export const useArchiveDiet = () => {
  const [isArchiving, setIsArchiving] = useState(false);

  const archiveDiet = async (dietId: number) => {
    try {
      setIsArchiving(true);
      const response = await fetch(`/api/diets/${dietId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się zarchiwizować diety");
      }

      toast.success("Dieta została zarchiwizowana");
      navigate("/diets");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd podczas archiwizacji diety");
    } finally {
      setIsArchiving(false);
    }
  };

  return { archiveDiet, isArchiving };
};
