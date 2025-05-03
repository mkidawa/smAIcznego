import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import ErrorAlert from "@/components/ErrorAlert";
import { useRegister, registerSchema } from "@/modules/auth/hooks/useRegister";

type FormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  redirectUrl?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ redirectUrl = "/diets" }) => {
  const { register, isLoading, error } = useRegister({ redirectUrl });

  const formsMethods = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (data: FormData) => {
    await register(data);
  };

  return (
    <form onSubmit={formsMethods.handleSubmit(handleSubmit)} className="space-y-4">
      {error && <ErrorAlert message={error} />}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Adres email
        </label>
        <Controller
          control={formsMethods.control}
          name="email"
          render={({ field, fieldState }) => (
            <Input id="email" type="email" {...field} className="mt-1" errorMessage={fieldState.error?.message} />
          )}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Hasło
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
          Potwierdź hasło
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
          Masz już konto? Zaloguj się
        </a>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full cursor-pointer">
          {isLoading ? "Rejestracja..." : "Zarejestruj się"}
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;
