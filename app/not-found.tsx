import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fi-status-page">
      <div className="fi-status-card">
        <p className="fi-status-code">404</p>
        <h1>That page isn&rsquo;t here.</h1>
        <p>The link may be old, or the page may have moved.</p>
        <div className="fi-status-actions">
          <Link href="/">Go home</Link>
          <Link href="/app">Open Faith In</Link>
        </div>
      </div>
    </main>
  );
}
