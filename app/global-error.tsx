"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[Faith In] Global error", error.digest ?? "client-render-error");
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f8f5", color: "#173326", fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <section
            aria-labelledby="global-error-title"
            style={{
              width: "min(100%, 520px)",
              padding: "32px",
              border: "1px solid #d7e4da",
              borderRadius: "20px",
              background: "#fff",
              boxShadow: "0 18px 48px rgba(23, 51, 38, 0.1)",
              textAlign: "center",
            }}
          >
            <title>Something went wrong | Faith In</title>
            <p style={{ margin: "0 0 8px", color: "#557263", fontWeight: 700 }}>Something went wrong</p>
            <h1 id="global-error-title" style={{ margin: "0 0 12px", fontSize: "clamp(1.8rem, 5vw, 2.5rem)" }}>
              We couldn&rsquo;t open Faith In.
            </h1>
            <p style={{ margin: "0 0 24px", color: "#557263", lineHeight: 1.6 }}>
              Your account and content are safe. Please try again, or return to the homepage.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={retry}
                style={{
                  border: 0,
                  borderRadius: "999px",
                  padding: "12px 20px",
                  background: "#266640",
                  color: "#fff",
                  cursor: "pointer",
                  font: "inherit",
                  fontWeight: 700,
                }}
              >
                Try again
              </button>
              <Link
                href="/"
                style={{
                  border: "1px solid #b9cdbf",
                  borderRadius: "999px",
                  padding: "11px 20px",
                  color: "#266640",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Go home
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
