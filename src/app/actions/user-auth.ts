"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createUserSession, destroyUserSession } from "@/lib/user-session";

function normalizeEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

export async function registerUser(
  _prevState: string | undefined,
  formData: FormData,
) {
  const email = normalizeEmail(formData);
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !email.includes("@")) {
    return "Please enter a valid email address.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return "An account with this email already exists. Try logging in instead.";
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ email, passwordHash });

  await createUserSession(email);
  redirect("/dashboard");
}

export async function loginUser(
  _prevState: string | undefined,
  formData: FormData,
) {
  const email = normalizeEmail(formData);
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Please enter your email and password.";
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user) {
    return "Incorrect email or password.";
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return "Incorrect email or password.";
  }

  await createUserSession(email);
  redirect("/dashboard");
}

export async function logoutUser() {
  await destroyUserSession();
  redirect("/login");
}
