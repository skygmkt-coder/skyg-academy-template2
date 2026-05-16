export default function LearningLoading() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="h-96 animate-pulse rounded bg-white/10" />
        <div className="aspect-video animate-pulse rounded bg-black" />
      </div>
    </main>
  );
}
