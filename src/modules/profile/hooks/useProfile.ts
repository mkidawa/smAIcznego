import { useState, useEffect } from "react";
import type { UpdateProfileCommand, ProfileResponse } from "@/types";

/**
 * Hook do zarządzania profilem użytkownika - pobieranie i aktualizacja danych
 * @returns Obiekt zawierający dane profilu, funkcje update/refresh, stany ładowania i błędy
 */
export function useProfile() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profiles");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch profile"));
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: UpdateProfileCommand) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profiles", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(new Error(errorMessage));
      console.error("Error updating profile:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile,
    updateProfile,
  };
}
