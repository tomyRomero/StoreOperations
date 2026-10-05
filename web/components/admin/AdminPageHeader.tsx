import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: React.ReactNode;
  description?: React.ReactNode;
  // Where "back" goes on a detail or form page
  back?: { href: string; label: string };
  // The page's main buttons, on the right
  actions?: React.ReactNode;
};

export function AdminPageHeader({ title, description, back, actions }: Props) {
  return (
    <div className="mb-6 grid gap-3">
      {back && (
        <Link href={back.href} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid min-w-0 gap-1">
          <h1 className="font-sans text-[28px] font-semibold leading-tight tracking-[-0.03em]">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
