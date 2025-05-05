import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateGenerationCommand } from "../../../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { Multiselect } from "../../../../components/ui/multiselect";

const optionsMap = [
  { value: "polish", label: "Polska" },
  { value: "italian", label: "Włoska" },
  { value: "indian", label: "Indyjska" },
  { value: "asian", label: "Azjatycka" },
  { value: "vegan", label: "Wegańska" },
  { value: "vegetarian", label: "Wegetariańska" },
  { value: "gluten-free", label: "Bezglutenowa" },
  { value: "keto", label: "Ketogeniczna" },
  { value: "paleo", label: "Paleo" },
];

const cuisineEnum = z.enum([
  "polish",
  "italian",
  "indian",
  "asian",
  "vegan",
  "vegetarian",
  "gluten-free",
  "keto",
  "paleo",
]);

const formSchema = z.object({
  number_of_days: z.number().min(1, "Liczba dni musi być co najmniej 1").max(14, "Liczba dni nie może przekraczać 14"),
  calories_per_day: z.number().positive("Kalorie muszą być liczbą dodatnią"),
  meals_per_day: z.number().min(1, "Liczba posiłków musi być co najmniej 1"),
  preferred_cuisines: z.array(cuisineEnum),
});

type FormData = z.infer<typeof formSchema>;

interface DietFormProps {
  onSubmit: (data: CreateGenerationCommand) => void;
  isLoading: boolean;
}

const valueToNumber = (value: string) => {
  if (value === "") return null;
  if (isNaN(Number(value))) return 0;
  return Number(value);
};

const DietForm: React.FC<DietFormProps> = ({ onSubmit, isLoading }) => {
  const formsMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number_of_days: 3,
      calories_per_day: 2200,
      meals_per_day: 3,
      preferred_cuisines: [],
    },
    mode: "onSubmit",
  });

  return (
    <form onSubmit={formsMethods.handleSubmit(onSubmit)} className="space-y-4 mb-4" data-testid="diet-generate-form">
      <div>
        <label htmlFor="number_of_days" className="block text-sm font-medium text-gray-700">
          Liczba dni
        </label>
        <Controller
          control={formsMethods.control}
          name="number_of_days"
          render={({ field, fieldState }) => (
            <Input
              id="number_of_days"
              type="number"
              {...field}
              onChange={(e) => field.onChange(valueToNumber(e.target.value))}
              className="mt-1"
              errorMessage={fieldState.error?.message}
              data-testid="days-input"
            />
          )}
        />
      </div>

      <div>
        <label htmlFor="calories_per_day" className="block text-sm font-medium text-gray-700">
          Kalorie na dzień
        </label>
        <Controller
          control={formsMethods.control}
          name="calories_per_day"
          render={({ field, fieldState }) => (
            <Input
              id="calories_per_day"
              type="number"
              {...field}
              onChange={(e) => field.onChange(valueToNumber(e.target.value))}
              className="mt-1"
              errorMessage={fieldState.error?.message}
              data-testid="calories-input"
            />
          )}
        />
      </div>

      <div>
        <label htmlFor="meals_per_day" className="block text-sm font-medium text-gray-700">
          Liczba posiłków
        </label>
        <Controller
          control={formsMethods.control}
          name="meals_per_day"
          render={({ field, fieldState }) => (
            <Input
              id="meals_per_day"
              type="number"
              {...field}
              onChange={(e) => field.onChange(valueToNumber(e.target.value))}
              className="mt-1"
              errorMessage={fieldState.error?.message}
              data-testid="meals-input"
            />
          )}
        />
      </div>

      <div>
        <label htmlFor="preferred_cuisines" className="block text-sm font-medium text-gray-700">
          Preferowane kuchnie <span className="text-xs text-gray-500">(opcjonalne)</span>
        </label>
        <Controller
          control={formsMethods.control}
          name="preferred_cuisines"
          render={({ field, fieldState }) => (
            <Multiselect
              wrapperClassName="mt-1"
              options={optionsMap}
              value={field.value}
              onChange={(value) => field.onChange(value)}
              errorMessage={fieldState.error?.message}
              data-testid="cuisines-input"
            />
          )}
        />
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full cursor-pointer" data-testid="submit-button">
          {isLoading ? "Generowanie..." : "Generuj Dietę"}
        </Button>
      </div>
    </form>
  );
};

export default DietForm;
