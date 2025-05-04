import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

teardown("logout and database cleanup", async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  console.log("Cleaning up test database...");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials");
  }

  if (!supabaseUrl.includes("wcirwb")) {
    throw new Error("Cannot run teardown on non-test database!");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Sign in with test user credentials to avoid issues with RLS
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.E2E_USERNAME || "",
      password: process.env.E2E_PASSWORD || "",
    });

    if (signInError) {
      console.error("Error signing in:", signInError);
      throw signInError;
    }

    // Usuń wszystkie rekordy z generations oprócz id=1
    const { error: generationsError } = await supabase.from("generation").delete().neq("id", 1);

    // Usuń wszystkie rekordy z generations_log
    const { error: generationsLogError } = await supabase.from("generation_log").delete().neq("id", 0);

    if (generationsError) {
      console.error("Error cleaning up generations:", generationsError);
      throw generationsError;
    }

    if (generationsLogError) {
      console.error("Error cleaning up generations_log:", generationsLogError);
      throw generationsLogError;
    }

    console.log("Successfully cleaned up collections for E2E test user");
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Failed to clean up database:", error);
    throw error;
  }
});
