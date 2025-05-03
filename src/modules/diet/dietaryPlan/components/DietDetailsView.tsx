import { useGetDietDetail } from "../hooks/useGetDietDetail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { navigate } from "astro:transitions/client";
import type { MealItem } from "../../diet.types";
import { MEALS_MAP } from "@/lib/constants";

interface DietViewProps {
  dietId: number;
}

export const DietDetailsView = ({ dietId }: DietViewProps) => {
  const { dietDetails, isLoading, error } = useGetDietDetail({ dietId: dietId || 0 });

  if (error) {
    toast.error(error);
    return null;
  }

  if (isLoading || !dietId) {
    return <LoadingState />;
  }

  if (!dietDetails) {
    navigate("/diets/generate");
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <SummaryCard
        numberOfDays={dietDetails.number_of_days}
        caloriesPerDay={dietDetails.calories_per_day}
        startDate={dietDetails.created_at}
        endDate={dietDetails.end_date}
      />

      <Tabs defaultValue="plan" className="mt-8">
        <TabsList>
          <TabsTrigger className="cursor-pointer" value="plan">
            Plan Posiłków
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="shopping">
            Lista Zakupów
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          <MealSchedule mealsByDay={groupMealsByDay(dietDetails.meals)} />
        </TabsContent>

        <TabsContent value="shopping">
          <ShoppingListView items={dietDetails.shoppingList} />
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end space-x-4">
        <Button variant="outline" onClick={() => navigate("/diets/generate")}>
          Nowa Dieta
        </Button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="container mx-auto py-8 space-y-8">
    <Card>
      <CardHeader>
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const SummaryCard = ({
  numberOfDays,
  caloriesPerDay,
  startDate,
  endDate,
}: {
  numberOfDays: number;
  caloriesPerDay: number;
  startDate: string;
  endDate: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Twój Plan Diety</CardTitle>
      <CardDescription>
        Plan na {numberOfDays} dni, {caloriesPerDay} kalorii dziennie
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Data rozpoczęcia: {new Date(startDate).toLocaleDateString("pl-PL")}</p>
        <p>Data zakończenia: {new Date(endDate).toLocaleDateString("pl-PL")}</p>
      </div>
    </CardContent>
  </Card>
);

const MealSchedule = ({ mealsByDay }: { mealsByDay: Record<number, MealItem[]> }) => (
  <ScrollArea className="h-[600px] pr-4">
    {Object.entries(mealsByDay).map(([day, meals]) => (
      <Card key={day} className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Dzień {parseInt(day) + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.id} className="border-l-2 border-primary pl-4">
                <h4 className="font-medium">
                  {MEALS_MAP[meal.meal_type]} ({meal.approx_calories} kcal)
                </h4>
                {meal.instructions && (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{meal.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </ScrollArea>
);

const ShoppingListView = ({ items }: { items: string[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Lista Zakupów</CardTitle>
      <CardDescription>Produkty potrzebne do przygotowania wszystkich posiłków</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="list-disc list-inside space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const groupMealsByDay = (meals: MealItem[]): Record<number, MealItem[]> => {
  return meals.reduce(
    (acc, meal) => {
      if (!acc[meal.day]) {
        acc[meal.day] = [];
      }
      acc[meal.day].push(meal);
      return acc;
    },
    {} as Record<number, MealItem[]>
  );
};
