import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import ErrorAlert from "@/components/ErrorAlert";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const formSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

type FormData = z.infer<typeof formSchema>;

interface LoginFormProps {
  redirectUrl?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ redirectUrl = "/diets" }) => {
  const { login, isLoading, error } = useAuth({ redirectUrl });

  const formsMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (data: FormData) => {
    await login(data);
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

      <div className="flex justify-between items-center text-sm">
        <a href="/reset-password" className="text-primary hover:underline">
          Zapomniałeś hasła?
        </a>
        <a href="/register" className="text-primary hover:underline">
          Nie masz konta? Zarejestruj się
        </a>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full cursor-pointer">
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
