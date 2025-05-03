import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import ErrorAlert from "@/components/ErrorAlert";
import { useResetPassword, resetPasswordSchema } from "@/modules/auth/hooks/useResetPassword";

type FormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  redirectUrl?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ redirectUrl = "/login" }) => {
  const { resetPassword, isLoading, error, success } = useResetPassword({ redirectUrl });

  const formsMethods = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (data: FormData) => {
    await resetPassword(data);
  };

  return (
    <form onSubmit={formsMethods.handleSubmit(handleSubmit)} className="space-y-4">
      {error && <ErrorAlert message={error} />}
      {success && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          Link do resetowania hasła został wysłany na podany adres email. Za chwilę zostaniesz przekierowany.
        </div>
      )}

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

      <div className="flex justify-end text-sm">
        <a href="/login" className="text-primary hover:underline">
          Powrót do logowania
        </a>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full cursor-pointer">
          {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
