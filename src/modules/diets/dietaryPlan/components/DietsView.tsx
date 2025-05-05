import { useGetDiets } from "../hooks/useGetDiets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { navigate } from "astro:transitions/client";
import { CUISINES_MAP } from "@/lib/constants";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

export const DietsView = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Showing 6 items per page for better grid layout
  const { diets, isLoading, error, pagination } = useGetDiets({
    page: currentPage,
    perPage: itemsPerPage,
  });

  const totalPages = Math.ceil(pagination.total / pagination.perPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    toast.error(error);
    return null;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div data-testid="diets-view" className="container mx-auto py-8 max-w-screen-lg px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Twoje Diety</h1>
        <Button className="cursor-pointer" onClick={() => navigate("/diets/generate")}>
          Wygeneruj Nową Dietę
        </Button>
      </div>

      {diets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div data-testid="diets-list" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {diets.map((diet) => (
              <DietCard
                key={diet.id}
                id={diet.id}
                numberOfDays={diet.number_of_days}
                caloriesPerDay={diet.calories_per_day}
                startDate={diet.created_at}
                endDate={diet.end_date}
                status={diet.status}
                cuisines={diet.preferred_cuisines}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, current page, last page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const LoadingState = () => (
  <div data-testid="loading-state" className="container mx-auto py-8 max-w-screen-lg px-4">
    <div className="flex justify-between items-center mb-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="h-10 w-40 bg-muted animate-pulse rounded" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
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
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <Card data-testid="empty-state" className="text-center py-12 max-w-sm mx-auto">
    <CardHeader>
      <CardTitle>Brak Diet</CardTitle>
      <CardDescription>
        Nie masz jeszcze żadnych wygenerowanych diet. Rozpocznij od wygenerowania swojej pierwszej diety!
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button className="cursor-pointer" onClick={() => navigate("/diets/generate")}>
        Wygeneruj Pierwszą Dietę
      </Button>
    </CardContent>
  </Card>
);

const DietCard = ({
  id,
  numberOfDays,
  caloriesPerDay,
  startDate,
  endDate,
  status,
  cuisines,
}: {
  id: number;
  numberOfDays: number;
  caloriesPerDay: number;
  startDate: string;
  endDate: string;
  status: string;
  cuisines: string[];
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "meals_ready":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "W przygotowaniu";
      case "meals_ready":
        return "Posiłki gotowe";
      case "ready":
        return "Gotowa";
      default:
        return status;
    }
  };

  return (
    <Card
      data-testid="diet-card"
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/diets/${id}`)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Plan {numberOfDays}-dniowy</CardTitle>
            <CardDescription>{caloriesPerDay} kcal dziennie</CardDescription>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
            {getStatusText(status)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Od: {new Date(startDate).toLocaleDateString("pl-PL")}</p>
          <p>Do: {new Date(endDate).toLocaleDateString("pl-PL")}</p>
          {cuisines.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {cuisines.map((cuisine) => (
                <span key={cuisine} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {CUISINES_MAP[cuisine as keyof typeof CUISINES_MAP]}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
