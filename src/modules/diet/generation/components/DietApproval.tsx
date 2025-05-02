import React from "react";
import type { DietPlanResponse } from "@/modules/openRouter/openRouter.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DietApprovalProps {
  diet: DietPlanResponse;
  onApprove: () => void;
  onReject: () => void;
}

const DietApproval: React.FC<DietApprovalProps> = ({ diet, onApprove, onReject }) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Przegląd Wygenerowanej Diety</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="plan" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="plan" className="flex-1 cursor-pointer">
                Plan Diety
              </TabsTrigger>
              <TabsTrigger value="shopping" className="flex-1 cursor-pointer">
                Lista Zakupów
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plan">
              <ScrollArea className="h-[600px] pr-4">
                {diet.diet_plan.map((day) => (
                  <Card key={day.day} className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Dzień {day.day + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {day.meals?.map((meal) => (
                          <div key={meal.meal_number_in_day} className="border-l-2 border-primary pl-4">
                            <h4 className="font-medium">
                              {meal.name} ({meal.calories} kcal)
                            </h4>
                            <ul className="mt-2 text-sm text-muted-foreground">
                              {meal.ingredients.map((ingredient, idx) => (
                                <li key={idx + meal.meal_number_in_day}>
                                  {ingredient.name} - {ingredient.quantity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="shopping">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {diet.shopping_list.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="mx-2">-</span>
                          <span className="text-muted-foreground">{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onReject} className="cursor-pointer">
          Odrzuć
        </Button>
        <Button onClick={onApprove} className="cursor-pointer">
          Zatwierdź
        </Button>
      </div>
    </div>
  );
};

export default DietApproval;
