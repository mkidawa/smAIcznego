import { useProfile } from "../hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileDetails } from "./ProfileDetails";
import { useState } from "react";
import { ProfileEditForm } from "./ProfileEditForm";

export const ProfileView = () => {
  const [editMode, setEditMode] = useState(false);
  const { profile, isLoading, error, refresh, updateProfile } = useProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 border-red-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-600">Błąd</CardTitle>
          <CardDescription>{error.message || "Nie udało się pobrać danych profilu"}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={refresh}>
            Spróbuj ponownie
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!profile) {
    return <EmptyProfile refresh={refresh} />;
  }

  if (editMode) {
    return (
      <ProfileEditForm
        profile={profile}
        onCancel={() => setEditMode(false)}
        onSubmit={async (data) => {
          await updateProfile(data);
          setEditMode(false);
        }}
      />
    );
  }

  return <ProfileDetails profile={profile} onEdit={() => setEditMode(true)} />;
};

const EmptyProfile = ({ refresh }: { refresh: () => Promise<void> }) => (
  <Card className="w-full max-w-md mx-auto mt-8">
    <CardHeader>
      <CardTitle>Brak profilu</CardTitle>
      <CardDescription>Nie znaleziono danych profilu</CardDescription>
    </CardHeader>
    <CardFooter>
      <Button onClick={refresh}>Odśwież</Button>
    </CardFooter>
  </Card>
);

const ProfileSkeleton = () => {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="pb-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <div className="flex flex-wrap gap-2">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
};
