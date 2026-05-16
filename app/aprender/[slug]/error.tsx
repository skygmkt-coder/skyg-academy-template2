"use client";

export default function LearningError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 p-6">
        <h1 className="text-xl font-semibold">No pudimos cargar la leccion</h1>
        <p className="mt-2 text-sm text-slate-300">Intenta de nuevo en unos segundos.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
