"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render(container: HTMLElement, options: Record<string, unknown>): string;
      reset(widgetId?: string): void;
      remove(widgetId: string): void;
    };
  }
}

type TurnstileWidgetProps = { siteKey: string; resetSignal: string | undefined };

export function TurnstileWidget({ siteKey, resetSignal }: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [scriptReady, setScriptReady] = useState(false);
  const [message, setMessage] = useState(siteKey ? "Complete the security verification before submitting." : "Security verification is unavailable. Please try again later.");

  const renderWidget = useCallback(() => {
    if (!siteKey || !container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action: "contact_submission",
      "response-field-name": "turnstileToken",
      callback: () => setMessage("Security verification complete."),
      "expired-callback": () => setMessage("Security verification expired. Please complete it again."),
      "error-callback": () => setMessage("Security verification is unavailable. Please try again."),
    });
  }, [siteKey]);

  useEffect(() => { if (scriptReady || window.turnstile) renderWidget(); }, [renderWidget, scriptReady]);
  useEffect(() => {
    if (resetSignal && widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      setMessage("Please complete the security verification again.");
    }
  }, [resetSignal]);
  useEffect(() => () => { if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); }, []);

  return <section aria-label="Security verification"><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setScriptReady(true)} /><div ref={container} /><p role="status">{message}</p></section>;
}
