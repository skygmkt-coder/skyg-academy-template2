export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-64 w-full animate-pulse rounded-lg bg-white" />
      </div>
    </main>
  );
}
