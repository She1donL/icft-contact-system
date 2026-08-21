"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/admin/admin.module.css";
import { ProspectSaveMessage } from "./prospect-save-message";

export function ProspectSaveRedirect({ returnTo }: { returnTo: string }) {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => router.replace(returnTo), 1000);
    return () => window.clearTimeout(timeout);
  }, [returnTo, router]);

  return <div className={styles.notice}><ProspectSaveMessage /></div>;
}
