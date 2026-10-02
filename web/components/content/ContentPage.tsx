import { Children, isValidElement } from "react";
import Link from "next/link";
import { OnThisPage } from "./OnThisPage";

type Fact = { big: string; small: string };

type PageProps = {
  // The small line above the title, such as "Help"
  eyebrow: string;
  title: string;
  lead: React.ReactNode;
  // Up to three numbers worth seeing first, such as "$10" over "flat shipping per order"
  facts?: Fact[];
  // ContentSections; their titles make the page's contents
  children: React.ReactNode;
};

const glows = ["bg-glow-green", "bg-glow-violet", "bg-glow-blue"];

// A section's anchor, from its title: "Cookies and your browser" is #cookies-and-your-browser
const anchor = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// The reading pages (shipping and returns, privacy): a large title, the facts at a glance, then the
// sections beside their contents, and a way to ask a person at the end
export function ContentPage({ eyebrow, title, lead, facts, children }: PageProps) {
  const sections = Children.toArray(children)
    .filter(isValidElement<{ title: string }>)
    .map((section) => ({ id: anchor(section.props.title), title: section.props.title }));

  return (
    <div className="relative isolate overflow-x-clip">
      <div aria-hidden className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[1100px] max-w-full -translate-x-1/2 bg-[radial-gradient(45%_50%_at_30%_40%,color-mix(in_oklab,var(--glow-green)_14%,transparent),transparent_70%),radial-gradient(40%_50%_at_75%_30%,color-mix(in_oklab,var(--glow-violet)_16%,transparent),transparent_70%)] opacity-(--glow-strength)" />
      <div className="container max-w-[1160px] py-12 lg:py-20">
        <div className="grid gap-4">
          <p className="font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-accent">{eyebrow}</p>
          <h1 className="text-[44px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[64px] lg:text-[80px]">{title}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{lead}</p>
        </div>

        {facts && facts.length > 0 && (
          <ul aria-label="At a glance" className="mt-10 grid grid-cols-3 gap-2 sm:gap-3.5">
            {facts.map((fact, i) => (
              <li key={fact.small} className="relative isolate grid content-start gap-1 overflow-hidden rounded-[18px] border bg-card p-3.5 sm:gap-1.5 sm:rounded-[24px] sm:p-6">
                <span aria-hidden className={`absolute -bottom-16 -right-12 -z-10 size-44 rounded-full opacity-[calc(0.22*var(--glow-strength))] blur-[50px] ${glows[i % glows.length]}`} />
                <span className="text-[22px] font-semibold leading-tight tracking-[-0.045em] sm:text-[34px]">{fact.big}</span>
                <span className="text-[13px] leading-snug text-muted-foreground sm:text-[15px]">{fact.small}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-14 grid gap-12 lg:mt-18 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <OnThisPage sections={sections} />
          <div className="grid max-w-[680px] gap-12">
            {children}
            <div className="flex flex-wrap items-center justify-between gap-5 rounded-[24px] border bg-linear-135 from-glow-violet/12 to-card to-70% p-6 sm:p-7">
              <p className="grid gap-1">
                <span className="text-[17px] font-semibold">Still have a question?</span>
                <span className="text-sm text-muted-foreground">A person replies by email.</span>
              </p>
              <Link href="/contact" className="inline-flex h-11.5 items-center rounded-button bg-primary px-5.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/85">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// One titled section. Its anchor comes from the title, so the page's contents can link to it.
export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = anchor(title);
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="grid scroll-mt-28 gap-3.5 text-[17px] leading-[1.75] text-ink-2 [&_a]:font-semibold [&_a]:text-accent [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:pl-1 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-2 [&_ul]:pl-5 [&_ul]:marker:text-faint"
    >
      <h2 id={`${id}-heading`} className="font-sans text-[26px] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[30px]">
        {title}
      </h2>
      {children}
    </section>
  );
}
