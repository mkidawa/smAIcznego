import React, { useState } from "react";
import DietForm from "./DietForm.tsx";
import DietApproval from "./DietApproval.tsx";
import ErrorAlert from "../../../components/ErrorAlert.tsx";
import { Progress } from "@/components/ui/progress";
import useGenerateDiet from "../hooks/useGenerateDiet.ts";
import type { CreateGenerationCommand } from "../../../types.ts";

const DietGenerateView: React.FC = () => {
  const [step, setStep] = useState<"form" | "approval">("form");
  const { generateDiet, isLoading, progress, error, generatedDiet } = useGenerateDiet(() => setStep("approval"));

  const handleGenerateDiet = async (data: CreateGenerationCommand) => {
    await generateDiet(data);
  };

  const handleApprove = () => {
    // TODO: Implementacja zatwierdzania diety
    console.log("Zatwierdzono dietę");
  };

  const handleReject = () => {
    setStep("form");
  };

  return (
    <div className="p-4 w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generowanie Diety</h1>
      {error && <ErrorAlert message={error} />}
      {step === "form" && <DietForm onSubmit={handleGenerateDiet} isLoading={isLoading} />}
      {isLoading && <Progress value={progress} className="mt-4" />}
      {step === "approval" && generatedDiet && (
        <DietApproval diet={generatedDiet} onApprove={handleApprove} onReject={handleReject} />
      )}
    </div>
  );
};

export default DietGenerateView;
