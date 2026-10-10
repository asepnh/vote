"use server";

import { redirect } from "next/navigation";
import { createUserSession, destroyUserSession } from "@/lib/user-session";

export async function loginUser(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return "Please enter a valid email address.";
  }

  await createUserSession(email);
  redirect("/dashboard");
}

export async function logoutUser() {
  await destroyUserSession();
  redirect("/login");
}
