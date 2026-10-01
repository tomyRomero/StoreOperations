import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { cn } from "@/lib/utils";

type PageProps = {
  title: string;
  lead: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

// The plain reading pages (about, shipping and returns, privacy): a heading, a lead, then sections
export function ContentPage({ title, lead, children, className }: PageProps) {
  return (
    <div className={cn("container max-w-3xl py-8 lg:py-12", className)}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <h1 className="mt-4 text-h1">{title}</h1>
      <p className="mt-3 text-body-lg text-muted-foreground">{lead}</p>
      <div className="mt-10 grid gap-10">{children}</div>
    </div>
  );
}

// One titled section, with readable spacing for its paragraphs and lists
export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t pt-8 [&_a]:font-semibold [&_a]:text-accent [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:pl-1 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-2 [&_ul]:pl-5">
      <h2 className="text-h3">{title}</h2>
      {children}
    </section>
  );
}
