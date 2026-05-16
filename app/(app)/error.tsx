"use client";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="rounded-lg border border-red-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-950">Algo fallo</h1>
        <p className="mt-2 text-sm text-slate-600">No pudimos cargar la informacion protegida.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
