export default function FaithInPage() {
  return (
    <div className="curated-vault-premium-wrap">
      <div
        id="cv-root"
        className="cv-app-shell w-full flex min-h-screen flex-col relative"
      />
      <div
        id="cv-toast-container"
        className="pointer-events-none fixed left-1/2 top-24 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4"
      />
    </div>
  );
}
