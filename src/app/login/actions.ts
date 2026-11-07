"use server";

import { redirect } from "next/navigation";
import { staffEmailForUsername } from "@/lib/staff-accounts";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Please enter username and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const email = staffEmailForUsername(username);
  if (!email) {
    return { error: "Invalid username or password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid username or password." };
  }

  redirect("/");
}
