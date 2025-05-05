import { useCallback } from "react";

export const useLogout = () => {
  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Błąd podczas wylogowywania");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Błąd wylogowania:", error);
    }
  }, []);

  return { logout };
};
