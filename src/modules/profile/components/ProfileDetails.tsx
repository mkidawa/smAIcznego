import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { GENDER_MAP } from "@/lib/constants";
import type { ProfileResponse } from "@/types";

interface ProfileDetailsProps {
  profile: ProfileResponse;
  onEdit: () => void;
}

export const ProfileDetails = ({ profile, onEdit }: ProfileDetailsProps) => {
  return (
    <Card className="w-full max-w-lg mx-auto mt-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Twój profil</CardTitle>
        <CardDescription>
          <div className="flex flex-col items-start gap-2">
            Informacje o profilu dietetycznym
            {!profile.terms_accepted && (
              <Badge variant="outline">
                <span className="text-red-500">Wypełnij profil aby móc korzystać z aplikacji</span>
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Wiek</p>
            <p className="text-lg font-medium">{profile.age || "Nie podano"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Płeć</p>
            <p className="text-lg font-medium">
              {profile.gender ? GENDER_MAP[profile.gender as keyof typeof GENDER_MAP] : "Nie podano"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Waga</p>
            <p className="text-lg font-medium">{profile.weight ? `${profile.weight} kg` : "Nie podano"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Warunki zaakceptowane</p>
            <p className="text-lg font-medium">{profile.terms_accepted ? "Tak" : "Nie"}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Alergie</p>
          {profile.allergies && profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy, index) => (
                <Badge key={index} variant="outline">
                  {allergy}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-lg font-medium">Brak alergii</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onEdit} className="w-full cursor-pointer">
          Edytuj profil
        </Button>
      </CardFooter>
    </Card>
  );
};
