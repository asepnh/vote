"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-session";

export async function loginAdmin(_prevState: string | undefined, formData: FormData) {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return "Password is required.";
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return "Incorrect password.";
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin/login");
}
