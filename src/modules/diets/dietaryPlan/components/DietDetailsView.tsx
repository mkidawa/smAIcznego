import { useGetDietDetail } from "../hooks/useGetDietDetail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { navigate } from "astro:transitions/client";
import type { MealItem } from "../../diet.types";
import { MEALS_MAP } from "@/lib/constants";
import { groupMealsByDay } from "../utils/groupMealsByDay";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useArchiveDiet } from "../hooks/useArchiveDiet";

interface DietViewProps {
  dietId: number;
}

export const DietDetailsView = ({ dietId }: DietViewProps) => {
  const { dietDetails, isLoading, error } = useGetDietDetail({ dietId: dietId || 0 });
  const { archiveDiet, isArchiving } = useArchiveDiet();

  if (error) {
    toast.error(error);
    return null;
  }

  if (isLoading || !dietId) {
    return <LoadingState />;
  }

  if (!dietDetails) {
    navigate("/diets");
    return null;
  }

  return (
    <div data-testid="diet-details" className="container mx-auto py-8 max-w-screen-lg">
      <SummaryCard
        numberOfDays={dietDetails.number_of_days}
        caloriesPerDay={dietDetails.calories_per_day}
        startDate={dietDetails.created_at}
        endDate={dietDetails.end_date}
        onArchive={() => archiveDiet(dietId)}
        isArchiving={isArchiving}
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
        <Button className="cursor-pointer" variant="outline" onClick={() => navigate("/diets/generate")}>
          Nowa Dieta
        </Button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div data-testid="loading-state" className="container mx-auto py-8 max-w-screen-lg">
    <Card className="min-h-[400px]">
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
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
        </div>
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
  onArchive,
  isArchiving,
}: {
  numberOfDays: number;
  caloriesPerDay: number;
  startDate: string;
  endDate: string;
  onArchive: () => void;
  isArchiving: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Twój Plan Diety</CardTitle>
        <CardDescription>
          Plan na {numberOfDays} dni, {caloriesPerDay} kalorii dziennie
        </CardDescription>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz zarchiwizować tę dietę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja spowoduje przeniesienie diety do archiwum. Zarchiwizowana dieta nie będzie widoczna na głównej
              liście diet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={onArchive}
              disabled={isArchiving}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
            >
              {isArchiving ? "Archiwizowanie..." : "Archiwizuj"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
          <div className="space-y-4" data-testid={`day-${parseInt(day) + 1}-meals`}>
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
