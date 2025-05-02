import React from "react";
import DietForm from "./DietForm.tsx";
import ErrorAlert from "../../../components/ErrorAlert.tsx";
import { Progress } from "@/components/ui/progress";
import useGenerateDiet from "../hooks/useGenerateDiet.ts";
import type { CreateGenerationCommand } from "../../../types.ts";

const DietGenerateView: React.FC = () => {
  const { generateDiet, isLoading, progress, error } = useGenerateDiet();

  const handleGenerateDiet = async (data: CreateGenerationCommand) => {
    await generateDiet(data);
  };

  return (
    <div className="p-4 w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generowanie Diety</h1>
      {error && <ErrorAlert message={error} />}
      <DietForm onSubmit={handleGenerateDiet} isLoading={isLoading} />
      {isLoading && <Progress value={progress} className="mt-4" />}
    </div>
  );
};

export default DietGenerateView;
