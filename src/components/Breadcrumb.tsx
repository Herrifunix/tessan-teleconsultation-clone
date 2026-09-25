import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

export type BreadcrumbItem = { label: string; onClick?: () => void };

/** Fil d'Ariane (structure shadcn/ui de l'original) : masqué sous 768 px. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="hidden md:block mb-6">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5">
        {items.map((it, i) => (
          <Fragment key={`${i}-${it.label}`}>
            {i > 0 && (
              <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
                <ChevronRight />
              </li>
            )}
            <li className="inline-flex items-center gap-1.5">
              {it.onClick ? (
                <button type="button" onClick={it.onClick} className="hover:text-foreground transition-colors hover:underline cursor-pointer">
                  {it.label}
                </button>
              ) : (
                <span role="link" aria-disabled="true" aria-current="page" className="text-foreground font-normal">
                  {it.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
