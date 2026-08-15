"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[Faith In] Page error", error.digest ?? "client-render-error");
  }, [error]);

  return (
    <main className="fi-status-page">
      <div className="fi-status-card">
        <p className="fi-status-code">Something went wrong</p>
        <h1>We couldn&rsquo;t open this page.</h1>
        <p>Your account and content are safe. Please try again, or return to the homepage.</p>
        <div className="fi-status-actions">
          <button type="button" onClick={retry}>
            Try again
          </button>
          <Link href="/">Go home</Link>
        </div>
      </div>
    </main>
  );
}
