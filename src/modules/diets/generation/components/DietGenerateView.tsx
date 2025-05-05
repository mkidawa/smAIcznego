import React, { useState } from "react";
import DietForm from "./DietForm.tsx";
import DietApproval from "./DietApproval.tsx";
import ErrorAlert from "../../../../components/ErrorAlert.tsx";
import { Progress } from "@/components/ui/progress";
import useGenerateDiet from "../hooks/useGenerateDiet.ts";
import type { CreateGenerationCommand, CreateMealCommand } from "../../../../types.ts";
import { useCreateDiet } from "../../dietaryPlan/hooks/useCreateDiet.ts";
import { useAddMealsInBulk } from "@/modules/meals/hooks/useAddMealsInBulk.ts";
import { useCreateShoppingList } from "@/modules/shoppingLists/hooks/useCreateShoppingList.ts";
import { useGetDiet } from "../../dietaryPlan/hooks/useGetDiet.ts";
import { navigate } from "astro:transitions/client";

const DietGenerateView: React.FC = () => {
  const [step, setStep] = useState<"form" | "approval">("form");
  const {
    generateDiet,
    isLoading: isGenerating,
    progress,
    error,
    generatedDiet,
  } = useGenerateDiet(() => setStep("approval"));
  const { createDiet, isLoading: isCreatingDiet } = useCreateDiet();
  const { addMeals, isLoading: isAddingMeals } = useAddMealsInBulk();
  const { createShoppingList, isLoading: isCreatingShoppingList } = useCreateShoppingList();
  const {
    diet: fetchedDiet,
    isLoading: isGettingDiet,
    trigger: triggerRefetch,
  } = useGetDiet({ generationId: generatedDiet?.id });

  const isLoading = isGenerating || isCreatingDiet || isAddingMeals || isCreatingShoppingList || isGettingDiet;

  const handleGenerateDiet = async (data: CreateGenerationCommand) => {
    await generateDiet(data);
  };

  const handleApprove = async () => {
    if (!generatedDiet || !generatedDiet.preview) return;

    const { calories_per_day, number_of_days, preferred_cuisines } = generatedDiet.source_text;

    let dietToUse;

    if (!fetchedDiet) {
      const diet = await createDiet({
        calories_per_day,
        number_of_days,
        preferred_cuisines,
        generation_id: generatedDiet.id,
      });
      dietToUse = diet;
    } else {
      dietToUse = fetchedDiet;
    }

    if (dietToUse.status === "draft") {
      // Preview meals to bulk create
      const meals: CreateMealCommand[] = generatedDiet.preview.diet_plan
        .flatMap((day, index) =>
          day.meals.map((meal) => ({
            day: index,
            meal_type: meal.meal_type,
            approx_calories: meal.calories,
            instructions: meal.ingredients
              .map((ingredient) => {
                return `${ingredient.name} ${ingredient.quantity}`;
              })
              .join("\n"),
          }))
        )
        .flat();

      await addMeals({
        dietId: dietToUse.id,
        meals,
      });

      dietToUse = { ...dietToUse, status: "meals_ready" };
    }

    if (dietToUse.status === "meals_ready") {
      await createShoppingList(dietToUse.id, {
        items: generatedDiet.preview.shopping_list.map((ingredient) => `${ingredient.name} - ${ingredient.quantity}`),
      });

      dietToUse = { ...dietToUse, status: "ready" };

      await triggerRefetch();
    }

    navigate("/diets");
  };

  const handleReject = () => {
    setStep("form");
  };

  return (
    <div className="p-4 w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8" data-testid="diet-generate-title">
        Generowanie Diety
      </h1>
      {error && <ErrorAlert message={error} data-testid="diet-generate-error" />}
      {step === "form" && <DietForm onSubmit={handleGenerateDiet} isLoading={isLoading} />}
      {isGenerating && <Progress value={progress} className="mt-4" data-testid="diet-generate-progress" />}
      {!isGenerating && step === "approval" && generatedDiet?.preview && (
        <DietApproval
          dietStatus={fetchedDiet?.status || "draft"}
          diet={generatedDiet.preview}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default DietGenerateView;
