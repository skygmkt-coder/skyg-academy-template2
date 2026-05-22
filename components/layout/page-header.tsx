import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, meta, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-normal text-brand-primary">{eyebrow}</p>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-ink-primary sm:text-3xl">{title}</h1>
          {description ? <p className="max-w-2xl text-sm leading-6 text-ink-secondary">{description}</p> : null}
          {meta ? <p className="text-sm text-ink-muted">{meta}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">{actions}</div> : null}
    </header>
  );
}
