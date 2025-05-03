import { useState, useEffect } from "react";
import type { DietResponse, PaginatedResponse } from "@/types";

interface UseGetDietsProps {
  page?: number;
  perPage?: number;
}

interface UseGetDietsReturn {
  diets: DietResponse[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}

export const useGetDiets = ({ page = 1, perPage = 10 }: UseGetDietsProps = {}): UseGetDietsReturn => {
  const [diets, setDiets] = useState<DietResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page,
    perPage,
    total: 0,
  });

  useEffect(() => {
    const fetchDiets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/diets?page=${page}&per_page=${perPage}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to fetch diets");
        }

        const data: PaginatedResponse<DietResponse> = await response.json();

        setDiets(data.data);
        setPagination({
          page: data.page,
          perPage: data.per_page,
          total: data.total,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiets();
  }, [page, perPage]);

  return {
    diets,
    isLoading,
    error,
    pagination,
  };
};
