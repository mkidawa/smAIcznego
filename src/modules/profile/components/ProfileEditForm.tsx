import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { GENDER_MAP } from "@/lib/constants";
import type { ProfileResponse, UpdateProfileCommand } from "@/types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Lista popularnych alergii jako sugestie
const COMMON_ALLERGIES = [
  "gluten",
  "laktoza",
  "orzechy",
  "orzeszki ziemne",
  "soja",
  "ryby",
  "skorupiaki",
  "jaja",
  "pszenica",
  "sezam",
];

// Schemat walidacji Zod
const profileFormSchema = z.object({
  age: z
    .number({ required_error: "Wiek jest wymagany" })
    .min(13, { message: "Wiek musi być co najmniej 13 lat" })
    .max(120, { message: "Wiek nie może przekraczać 120 lat" }),
  gender: z.enum(["male", "female", "other"], { required_error: "Płeć jest wymagana" }),
  weight: z
    .number({ required_error: "Waga jest wymagana" })
    .positive({ message: "Waga musi być liczbą dodatnią" })
    .max(300, { message: "Waga nie może przekraczać 300 kg" }),
  allergies: z.array(z.string()),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "Musisz zaakceptować warunki korzystania z usługi",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  profile: ProfileResponse;
  onCancel: () => void;
  onSubmit: (data: UpdateProfileCommand) => Promise<void>;
}

export function ProfileEditForm({ profile, onCancel, onSubmit }: ProfileEditFormProps) {
  const [allergyInput, setAllergyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicjalizacja formularza
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      age: profile.age || undefined,
      gender: (profile.gender as "male" | "female" | "other" | undefined) || undefined,
      weight: profile.weight || undefined,
      allergies: profile.allergies || [],
      terms_accepted: profile.terms_accepted,
    },
  });

  // Obsługa dodawania alergii
  const handleAddAllergy = (allergy: string) => {
    const currentAllergies = form.getValues("allergies") || [];
    if (allergy && !currentAllergies.includes(allergy)) {
      form.setValue("allergies", [...currentAllergies, allergy]);
    }
    setAllergyInput("");
  };

  // Obsługa usuwania alergii
  const handleRemoveAllergy = (allergy: string) => {
    const currentAllergies = form.getValues("allergies") || [];
    form.setValue(
      "allergies",
      currentAllergies.filter((a) => a !== allergy)
    );
  };

  // Obsługa wysłania formularza
  const handleSubmitForm = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data as UpdateProfileCommand);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto my-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Edytuj profil</CardTitle>
        <CardDescription>Zmień swoje dane osobowe i preferencje dietetyczne</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitForm)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wiek</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Twój wiek"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Płeć</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz płeć" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(GENDER_MAP).map(([value, label]) => (
                        <SelectItem className="cursor-pointer" key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waga (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Twoja waga w kg"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Alergie <span className="text-xs text-muted-foreground">(opcjonalnie)</span>
                  </FormLabel>
                  <FormDescription>Wybierz z listy lub wprowadź własne alergie pokarmowe</FormDescription>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between">
                            Dodaj alergię
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Wyszukaj alergię..."
                              value={allergyInput}
                              onValueChange={setAllergyInput}
                            />
                            <CommandEmpty>
                              {allergyInput ? (
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => handleAddAllergy(allergyInput)}
                                >
                                  Dodaj &quot;{allergyInput}&quot;
                                </Button>
                              ) : (
                                "Nie znaleziono alergii"
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-40">
                                {COMMON_ALLERGIES.filter(
                                  (a) =>
                                    !field.value?.includes(a) && a.toLowerCase().includes(allergyInput.toLowerCase())
                                ).map((allergy) => (
                                  <CommandItem
                                    className="cursor-pointer"
                                    key={allergy}
                                    onSelect={() => handleAddAllergy(allergy)}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 cursor-pointer ${
                                        field.value?.includes(allergy) ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {allergy}
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {field.value?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((allergy) => (
                          <Badge
                            onClick={() => handleRemoveAllergy(allergy)}
                            key={allergy}
                            variant="secondary"
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            {allergy}
                            <X className="h-3 w-3  text-muted-foreground hover:text-foreground cursor-pointer" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms_accepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 my-8">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Akceptacja warunków</FormLabel>
                    <FormDescription>Akceptuję warunki korzystania z usługi i politykę prywatności.</FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto cursor-pointer"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" className="w-full sm:w-auto cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
