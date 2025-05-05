import { useProfile } from "../hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileDetails } from "./ProfileDetails";
import { useState } from "react";
import { ProfileEditForm } from "./ProfileEditForm";
import { Loader2 } from "lucide-react";

export const ProfileView = () => {
  const [editMode, setEditMode] = useState(false);
  const { profile, isLoading, error, refresh, updateProfile, isFetched } = useProfile();

  if (isLoading || !isFetched) {
    return <ProfileLoader />;
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

const ProfileLoader = () => {
  return (
    <div className="w-full max-w-md mx-auto mt-8 flex flex-col items-center justify-center p-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Ładowanie profilu...</p>
    </div>
  );
};
