"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Hash, LifeBuoy, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api/browser";
import type { Category, Product } from "@/lib/api/types";
import { glowFor } from "@/lib/glow";
import { matchParts } from "@/lib/highlight";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  // From Store settings: at or below it a result says how many are left
  lowStockThreshold: number;
};

// The help pages, found by any of their words
const helpPages = [
  { href: "/shipping-returns", label: "Shipping and returns", words: ["shipping", "returns", "delivery", "refund", "exchange", "tax"] },
  { href: "/contact", label: "Contact us", words: ["contact", "help", "email", "question", "support"] },
  { href: "/account/orders", label: "Your orders", words: ["orders", "track", "tracking", "account", "receipt"] },
  { href: "/about", label: "About us", words: ["about", "story", "who"] },
  { href: "/privacy", label: "Privacy", words: ["privacy", "data", "cookies"] },
];

type Option =
  | { kind: "product"; href: string; product: Product }
  | { kind: "jump"; href: string; label: string; meta: string; icon: "category" | "help" }
  | { kind: "all"; href: string; label: string };

const mac = () => /Mac|iPhone|iPad/.test(navigator.platform);
const noChange = () => () => {};

// Whether a key press landed in a field, where "/" is just a character
function typing(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

function categoryJumps(categories: Category[]): Option[] {
  return categories.map((category) => ({ kind: "jump", href: `/products?category=${category.id}`, label: category.name, meta: "Category", icon: "category" }));
}

// Search for the whole store in one place: products with their pictures as you type, the matching
// categories and help pages, and every result for the words. Opens with ⌘K or Ctrl+K anywhere, with /,
// or from the header. Arrow keys move, Enter opens, Escape closes.
export function SearchPalette({ categories, lowStockThreshold }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ text: string; items: Product[]; total: number } | null>(null);
  const [active, setActive] = useState(0);
  const latest = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shortcut = useSyncExternalStore(noChange, () => (mac() ? "⌘K" : "Ctrl K"), () => "⌘K");
  // On the product list, the words being searched for
  const current = pathname === "/products" ? (searchParams.get("q") ?? "") : "";

  // Asks for the first few products a moment after the last key, and keeps only the newest answer
  const search = (text: string) => {
    clearTimeout(timer.current);
    const words = text.trim();
    latest.current++;
    if (!words) {
      setResults(null);
      return;
    }
    const request = latest.current;
    timer.current = setTimeout(async () => {
      const { data } = await api.GET("/api/products", { params: { query: { search: words, pageSize: 5 } } });
      if (request === latest.current) setResults({ text: words, items: data?.items ?? [], total: data?.totalCount ?? 0 });
    }, 150);
  };

  const change = (text: string) => {
    setQuery(text);
    setActive(0);
    search(text);
  };

  const show = (text: string) => {
    change(text);
    setOpen(true);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const k = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (k || (event.key === "/" && !typing(event.target))) {
        event.preventDefault();
        setQuery("");
        setResults(null);
        setActive(0);
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keeps the highlighted option in view as the arrow keys move it
  useEffect(() => {
    document.getElementById(`search-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const words = query.trim();
  const lower = words.toLowerCase();
  const products = words && results ? results.items : [];
  const nothing = words !== "" && results?.text === words && results.total === 0;
  const matched: Option[] = [
    ...categoryJumps(categories.filter((category) => !lower || category.name.toLowerCase().includes(lower))),
    ...helpPages
      .filter((page) => !lower || page.label.toLowerCase().includes(lower) || page.words.some((word) => word.startsWith(lower)))
      .map((page): Option => ({ kind: "jump", href: page.href, label: page.label, meta: "Help", icon: "help" })),
  ].slice(0, lower ? 4 : 6);
  // When nothing at all matches, the categories are still a way forward
  const jumps = nothing && matched.length === 0 ? categoryJumps(categories) : matched;
  const options: Option[] = [
    ...products.map((product): Option => ({ kind: "product", href: `/products/${product.id}`, product })),
    ...jumps,
    ...(words && results && results.total > products.length
      ? [{ kind: "all", href: `/products?q=${encodeURIComponent(words)}`, label: `See all ${results.total} results for “${words}”` } as Option]
      : []),
  ];

  const go = (option: Option | undefined) => {
    const href = option?.href ?? (words ? `/products?q=${encodeURIComponent(words)}` : null);
    if (!href) return;
    setOpen(false);
    router.push(href);
  };

  const keys = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (options.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((active + step + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(options[active]);
    }
  };

  return (
    <>
      {/* The header's pill is a real search form, so it works before JavaScript loads. Once it has, pressing
          or typing in it opens the palette instead, carrying over the first key. */}
      <form role="search" action="/products" method="get" className="relative w-44 max-lg:hidden xl:w-56">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          name="q"
          aria-label="Search supplies"
          placeholder="Search"
          maxLength={100}
          onPointerDown={(event) => {
            event.preventDefault();
            show(current);
          }}
          onKeyDown={(event) => {
            if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
              event.preventDefault();
              show(event.key);
            } else if (event.key === "Enter" || event.key === "ArrowDown") {
              event.preventDefault();
              show(current);
            }
          }}
          className="h-10 w-full cursor-pointer rounded-full border border-input bg-foreground/4 pl-10 pr-14 text-sm font-medium placeholder:text-ink-3"
        />
        <kbd aria-hidden className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-foreground/8 px-1.5 py-0.5 font-mono text-xs text-ink-3">
          {shortcut}
        </kbd>
      </form>
      <button
        type="button"
        aria-label="Search"
        onClick={() => show(current)}
        className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 lg:hidden"
      >
        <Search className="size-5" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideClose
          className="top-2 block max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[680px] translate-y-0 overflow-hidden rounded-[22px] border-foreground/12 bg-popover p-0 shadow-[0_40px_120px_var(--shadow-strong)] sm:top-[116px] sm:max-h-[calc(100dvh-140px)]"
        >
          <DialogTitle className="sr-only">Search the store</DialogTitle>
          <DialogDescription className="sr-only">Products, categories and help. Use the arrow keys to move and Enter to open.</DialogDescription>
          <div aria-hidden className="pointer-events-none absolute -top-30 left-[20%] h-[200px] w-[400px] bg-[radial-gradient(50%_50%_at_50%_50%,rgb(139_108_255/0.25),transparent_70%)] opacity-(--glow-strength)" />

          <div className="relative flex h-[66px] items-center gap-3.5 border-b border-foreground/8 px-5">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              role="combobox"
              aria-label="Search"
              aria-expanded={options.length > 0}
              aria-controls={options.length > 0 ? "search-options" : undefined}
              aria-activedescendant={options.length > 0 ? `search-option-${active}` : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => change(event.target.value)}
              onKeyDown={keys}
              placeholder="Search supplies, categories and help"
              maxLength={100}
              className="h-full min-w-0 grow bg-transparent text-[19px] font-medium caret-glow-violet outline-none placeholder:text-muted-foreground"
            />
            <kbd className="shrink-0 rounded-[7px] border border-foreground/14 px-2 py-0.5 font-mono text-xs text-muted-foreground max-sm:hidden">esc</kbd>
          </div>

          <div className="relative max-h-[min(60dvh,520px)] overflow-y-auto p-2.5">
            {nothing && (
              <p className="px-3 pb-2 pt-3 text-[15px] text-muted-foreground">
                No supplies match “{words}”{jumps.length > 0 ? ". Try a category instead:" : "."}
              </p>
            )}
            {options.length > 0 && (
              <ul id="search-options" role="listbox" aria-label="Results" className="grid gap-0.5">
                {options.map((option, index) => {
                  const firstJump = option.kind === "jump" && (index === 0 || options[index - 1].kind !== "jump");
                  return (
                    <li key={option.href} role="presentation">
                      {index === 0 && option.kind === "product" && <GroupLabel>Products</GroupLabel>}
                      {firstJump && <GroupLabel>{words && !nothing ? "Jump to" : "Browse"}</GroupLabel>}
                      <div
                        id={`search-option-${index}`}
                        role="option"
                        aria-selected={index === active}
                        onClick={() => go(option)}
                        onMouseMove={() => index !== active && setActive(index)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3.5 rounded-[14px] px-3",
                          option.kind === "product" ? "h-[60px]" : "h-12",
                          index === active ? "bg-glow-violet/14" : "hover:bg-foreground/5",
                        )}
                      >
                        <OptionBody option={option} words={words} lowStockThreshold={lowStockThreshold} />
                        {index === active && (
                          <kbd aria-hidden className="shrink-0 rounded-[7px] bg-foreground/10 px-1.5 py-0.5 font-mono text-xs text-ink-2 max-sm:hidden">
                            ↵
                          </kbd>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="relative flex h-[46px] items-center justify-between gap-4 border-t border-foreground/8 bg-foreground/2 px-5 font-mono text-xs text-muted-foreground">
            <span className="flex gap-4 max-sm:hidden" aria-hidden>
              <span>↑ ↓ move</span>
              <span>↵ open</span>
              <span>esc close</span>
            </span>
            <span aria-live="polite" className="ml-auto">
              {words && results?.text === words ? (results.total === 1 ? "1 product matches" : `${results.total} products match`) : ""}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden className="block px-3 pb-1 pt-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint">
      {children}
    </span>
  );
}

// A row's picture or icon, its words and its price or kind. Notes use muted text, which stays above 4.5:1
// on the highlighted row's violet tint.
function OptionBody({ option, words, lowStockThreshold }: { option: Option; words: string; lowStockThreshold: number }) {
  if (option.kind === "product") {
    const { product } = option;
    const parts = matchParts(product.name, words);
    const regular = product.compareAtPriceCents;
    const note =
      product.stock <= 0
        ? "sold out"
        : regular !== null && regular > product.priceCents
          ? `on sale, was ${formatMoney(regular)}`
          : product.stock <= lowStockThreshold
            ? `only ${product.stock} left`
            : null;
    return (
      <>
        <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted" style={{ "--glow": glowFor(product.id) } as React.CSSProperties}>
          <span aria-hidden className="absolute inset-1.5 rounded-full bg-(--glow) opacity-[calc(0.45*var(--glow-strength))] blur-[10px]" />
          <Image src={product.imageUrl} alt="" fill sizes="44px" className="object-contain p-1.5" />
        </span>
        <span className="grid min-w-0 grow gap-0.5">
          <span className="truncate text-[15px] font-medium">
            {parts ? (
              <>
                {parts[0]}
                <mark className="bg-transparent font-bold text-accent">{parts[1]}</mark>
                {parts[2]}
              </>
            ) : (
              product.name
            )}
          </span>
          <span className="truncate text-[13px] text-muted-foreground">
            {product.categoryName}
            {note && ` · ${note}`}
          </span>
        </span>
        <span className="shrink-0 font-mono text-sm font-medium text-ink-2">{formatMoney(product.priceCents)}</span>
      </>
    );
  }

  if (option.kind === "jump") {
    const Icon = option.icon === "category" ? Hash : LifeBuoy;
    return (
      <>
        <span
          aria-hidden
          className={cn("grid size-8 shrink-0 place-items-center rounded-[10px]", option.icon === "category" ? "bg-glow-violet/16 text-accent" : "bg-glow-green/14 text-success")}
        >
          <Icon className="size-4" />
        </span>
        <span className="grow text-[15px]">{option.label}</span>
        <span className="shrink-0 text-[13px] text-muted-foreground">{option.meta}</span>
      </>
    );
  }

  return (
    <>
      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-foreground/8">
        <ArrowRight className="size-4" />
      </span>
      <span className="grow text-[15px] font-medium">{option.label}</span>
    </>
  );
}
