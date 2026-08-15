export default function FaithInPage() {
  return (
    <div className="curated-vault-premium-wrap">
      <div
        id="cv-root"
        className="cv-app-shell w-full flex min-h-screen flex-col relative"
      >
        <div className="fi-app-boot" role="status" aria-live="polite">
          <div className="fi-app-boot__mark" aria-hidden="true">
            <span>Faith</span>In
          </div>
          <div className="fi-app-boot__spinner" aria-hidden="true" />
          <p>Preparing your community…</p>
          <noscript>
            <p>Faith In needs JavaScript to sign you in and open the community.</p>
          </noscript>
        </div>
      </div>
      <div
        id="cv-toast-container"
        className="pointer-events-none fixed left-1/2 top-24 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4"
      />
    </div>
  );
}
