import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import ErrorAlert from "@/components/ErrorAlert";
import { useNewPassword } from "@/modules/auth/hooks/useNewPassword";
import { navigate } from "astro:transitions/client";
import { updatePasswordSchema } from "@/modules/auth/types/auth.schema";

type FormData = z.infer<typeof updatePasswordSchema>;

const NewPasswordForm: React.FC = () => {
  const { updatePassword, isLoading, error, success } = useNewPassword();

  const formsMethods = useForm<FormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (data: FormData) => {
    await updatePassword(data);

    // Clear form
    navigate("/login");
  };

  return (
    <form onSubmit={formsMethods.handleSubmit(handleSubmit)} className="space-y-4">
      {error && <ErrorAlert message={error} />}
      {success && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          Hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Nowe hasło
        </label>
        <Controller
          control={formsMethods.control}
          name="password"
          render={({ field, fieldState }) => (
            <Input id="password" type="password" {...field} className="mt-1" errorMessage={fieldState.error?.message} />
          )}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Potwierdź nowe hasło
        </label>
        <Controller
          control={formsMethods.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Input
              id="confirmPassword"
              type="password"
              {...field}
              className="mt-1"
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </div>

      <div className="flex justify-end text-sm">
        <a href="/login" className="text-primary hover:underline">
          Powrót do logowania
        </a>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full cursor-pointer">
          {isLoading ? "Zapisywanie..." : "Zmień hasło"}
        </Button>
      </div>
    </form>
  );
};

export default NewPasswordForm;
