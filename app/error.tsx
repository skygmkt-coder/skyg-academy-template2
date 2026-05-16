"use client";

export default function RootError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-950">No pudimos cargar el catalogo</h1>
        <p className="mt-2 text-sm text-slate-600">Intenta de nuevo en unos segundos.</p>
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
