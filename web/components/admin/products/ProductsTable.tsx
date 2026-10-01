"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ChevronDown, FolderInput, TagIcon } from "lucide-react";
import { BulkBar, SelectBox, useSelection } from "@/components/admin/list/selection";
import { SortableHead } from "@/components/admin/list/SortableHead";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import type { AdminCategory, AdminProduct } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  products: AdminProduct[];
  categories: AdminCategory[];
  lowStockThreshold: number;
  timeZone: string;
  sort: string;
  sortHrefs: { name: string; price: string; stock: string; created: string };
};

type Pending = { action: "archive" } | { action: "end_deal" } | { action: "move"; category: AdminCategory };

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// The products table. Ticked products can be archived, taken off sale, or moved to another category
// together; each action applies to the ticked products it makes sense for, and the dialog says which.
export function ProductsTable({ products, categories, lowStockThreshold, timeZone, sort, sortHrefs }: Props) {
  const router = useRouter();
  const selection = useSelection(products.map((p) => p.id));
  const [pending, setPending] = useState<Pending | null>(null);
  const [working, setWorking] = useState(false);
  // "Move to" opens the dialog from a menu item that's gone by the time it closes, so focus goes back to the
  // menu's button. Archive and End deal are buttons, which the dialog returns focus to by itself.
  const moveButton = useRef<HTMLButtonElement>(null);
  const fromMenu = useRef(false);

  const chosen = products.filter((p) => selection.isSelected(p.id));
  const eligibleFor = (p: Pending | null) => {
    if (!p) return [];
    if (p.action === "archive") return chosen.filter((product) => product.archivedAtUtc === null);
    if (p.action === "end_deal") return chosen.filter((product) => product.compareAtPriceCents !== null);
    return chosen.filter((product) => product.categoryId !== p.category.id);
  };
  const eligible = eligibleFor(pending);
  const toArchive = eligibleFor({ action: "archive" }).length;
  const onDeal = eligibleFor({ action: "end_deal" }).length;

  const apply = async () => {
    if (!pending || eligible.length === 0) return;
    setWorking(true);
    const { data, error } = await api.POST("/api/admin/products/bulk", {
      body: { ids: eligible.map((p) => p.id), action: pending.action, categoryId: pending.action === "move" ? pending.category.id : null },
    });
    setWorking(false);
    const done = pending;
    setPending(null);

    if (!data) {
      toast({ variant: "destructive", title: "Couldn't change the products", description: problemMessage(error) });
      return;
    }

    const verb = done.action === "archive" ? "archived" : done.action === "end_deal" ? "taken off sale" : `moved to ${done.category.name}`;
    if (data.succeeded.length > 0) toast({ variant: "success", title: `${plural(data.succeeded.length, "product", "products")} ${verb}` });
    if (data.failed.length > 0) {
      const name = (id: number) => products.find((p) => p.id === id)?.name ?? `Product ${id}`;
      toast({
        variant: "destructive",
        title: `${plural(data.failed.length, "product wasn't", "products weren't")} changed`,
        description: data.failed.map((f) => `${name(f.id)}: ${f.message}`).join(" "),
      });
    }
    selection.clear();
    router.refresh();
  };

  return (
    <div className="grid gap-3">
      <BulkBar count={selection.selected.length} noun={["product", "products"]} onClear={selection.clear}>
        <Button size="sm" variant="secondary" disabled={toArchive === 0} onClick={() => setPending({ action: "archive" })}>
          <Archive aria-hidden />
          Archive
        </Button>
        <Button size="sm" variant="secondary" disabled={onDeal === 0} onClick={() => setPending({ action: "end_deal" })}>
          <TagIcon aria-hidden />
          End deal
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button ref={moveButton} size="sm" variant="secondary">
              <FolderInput aria-hidden />
              Move to
              <ChevronDown aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Move to category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => {
              // Products already in this category stay put, so it's offered only if something would move
              const n = eligibleFor({ action: "move", category }).length;
              return (
                <DropdownMenuItem
                  key={category.id}
                  disabled={n === 0}
                  onSelect={() => {
                    fromMenu.current = true;
                    setPending({ action: "move", category });
                  }}
                >
                  <span className="flex-1">{category.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {n} of {chosen.length}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </BulkBar>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <SelectBox label="Select all products on this page" checked={selection.all} indeterminate={selection.some} onChange={selection.toggleAll} />
              </TableHead>
              <SortableHead label="Product" column="name" sort={sort} href={sortHrefs.name} />
              <TableHead>Category</TableHead>
              <SortableHead label="Price" column="price" sort={sort} href={sortHrefs.price} className="text-right [&>a]:flex-row-reverse" />
              <SortableHead label="Stock" column="stock" sort={sort} href={sortHrefs.stock} className="text-right [&>a]:flex-row-reverse" />
              <SortableHead label="Added" column="created" sort={sort} href={sortHrefs.created} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const selected = selection.isSelected(product.id);
              const archived = product.archivedAtUtc !== null;
              return (
                <TableRow key={product.id} data-state={selected ? "selected" : undefined}>
                  <TableCell>
                    <SelectBox label={`Select ${product.name}`} checked={selected} onChange={() => selection.toggle(product.id)} />
                  </TableCell>
                  <TableCell className="min-w-56">
                    <div className="flex items-center gap-3">
                      <Image src={product.imageUrl} alt="" width={40} height={40} className={cn("aspect-square shrink-0 rounded-sm object-cover", archived && "grayscale")} />
                      <div className="grid min-w-0 gap-1">
                        <Link href={`/admin/products/${product.id}`} className="truncate font-semibold hover:underline">
                          {product.name}
                        </Link>
                        {(archived || product.compareAtPriceCents !== null) && (
                          <span className="flex gap-1">
                            {archived && <Badge variant="neutral">Archived</Badge>}
                            {product.compareAtPriceCents !== null && <Badge variant="sale">On sale</Badge>}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{product.categoryName}</TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">
                    {product.compareAtPriceCents !== null && (
                      <span className="mr-2 text-muted-foreground line-through">
                        <span className="sr-only">was </span>
                        {formatMoney(product.compareAtPriceCents)}
                      </span>
                    )}
                    <span className="font-semibold">{formatMoney(product.priceCents)}</span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">
                    {product.stock === 0 ? (
                      <Badge variant="sale">Sold out</Badge>
                    ) : product.stock <= lowStockThreshold ? (
                      <Badge variant="warning">{product.stock} left</Badge>
                    ) : (
                      product.stock
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(product.createdAtUtc, timeZone)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && !working && setPending(null)}>
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            const opened = fromMenu.current;
            fromMenu.current = false;
            if (!opened || !moveButton.current?.isConnected) return;
            event.preventDefault();
            moveButton.current.focus();
          }}
        >
          {pending && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {pending.action === "archive"
                    ? `Archive ${plural(eligible.length, "product", "products")}?`
                    : pending.action === "end_deal"
                      ? `End the deal on ${plural(eligible.length, "product", "products")}?`
                      : `Move ${plural(eligible.length, "product", "products")} to ${pending.category.name}?`}
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="grid gap-2">
                    {pending.action === "archive" && (
                      <p>They leave the store and customers&apos; carts. Past orders keep them, and each can be restored from its page.</p>
                    )}
                    {pending.action === "end_deal" && <p>Their prices go back to the regular price.</p>}
                    <p>{eligible.map((p) => p.name).join(", ")}</p>
                    {eligible.length < chosen.length && (
                      <p>
                        {plural(chosen.length - eligible.length, "selected product doesn't", "selected products don't")} need this and{" "}
                        {chosen.length - eligible.length === 1 ? "is" : "are"} left as {chosen.length - eligible.length === 1 ? "it is" : "they are"}.
                      </p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={working}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={working || eligible.length === 0}
                  onClick={(event) => {
                    event.preventDefault();
                    void apply();
                  }}
                >
                  {working ? "Working…" : pending.action === "archive" ? "Archive" : pending.action === "end_deal" ? "End deals" : "Move"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
