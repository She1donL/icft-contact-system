"use server";
import { redirect } from "next/navigation";
import {
  passwordValidationCategory,
  recoveryFailurePath,
  recoveryPasswordFieldName,
} from "@/lib/auth/recovery-diagnostics";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get(recoveryPasswordFieldName) ?? "");
  const passwordFailure = passwordValidationCategory(password);

  if (passwordFailure) redirect(recoveryFailurePath(passwordFailure));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(recoveryFailurePath("missing-session"));

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.warn("password_recovery_update_failed", { category: "password-update" });
    redirect(recoveryFailurePath("password-update"));
  }

  redirect("/admin/login?reset=1");
}
